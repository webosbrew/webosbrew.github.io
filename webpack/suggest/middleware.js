// Dev server endpoints for the suggest-an-edit tool. Writes one file per
// suggestion into .suggestions/, which an agent watches, applies and deletes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {statusOf} from './naming.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export const SUGGEST_DIR = path.resolve('.suggestions');
const VIEWS = path.resolve('src/views');
const CONTEXT_LINES = 3;

/** @param text {string} @returns {string} */
function collapse(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Keep a resolved path inside the views tree. `page` arrives from the browser, so without
 * this a request for `/../../CLAUDE` resolves to a file outside `src/views`, and the hunk
 * quotes that file back in the saved suggestion. Compare against `VIEWS` plus a separator,
 * or a sibling directory such as `src/views-old` would pass a plain prefix test.
 * @param candidate {string}
 * @returns {boolean}
 */
function underViews(candidate) {
  const full = path.resolve(candidate);
  return full === VIEWS || full.startsWith(VIEWS + path.sep);
}

/**
 * Map a page URL back to the template it was built from. The bundler turns
 * `src/views/a/b.md` into `/a/b/index.html`, so try both shapes.
 * @param pagePath {string}
 * @returns {string | null} repo relative path, or null when nothing matches
 */
function sourceOf(pagePath) {
  const clean = pagePath.replace(/\/+$/, '').replace(/\/index\.html$/, '').replace(/^\//, '');
  const stems = clean ? [clean, `${clean}/index`] : ['index/index'];
  for (const stem of stems) {
    for (const ext of ['.md', '.hbs', '.html']) {
      const candidate = path.join(VIEWS, stem + ext);
      if (underViews(candidate) && fs.existsSync(candidate)) {
        return path.relative(process.cwd(), candidate).split(path.sep).join('/');
      }
    }
  }
  return null;
}

/**
 * The sidebar beside a page comes from the nearest _sidebar.md above it, the same walk
 * the markdown loader does. A comment on sidebar text belongs there, not on the page.
 * @param pagePath {string}
 * @returns {string | null} repo relative path, or null
 */
function sidebarOf(pagePath) {
  const clean = pagePath.replace(/\/+$/, '').replace(/^\//, '');
  let dir = path.join(VIEWS, clean);
  while (underViews(dir)) {
    const candidate = path.join(dir, '_sidebar.md');
    if (fs.existsSync(candidate)) {
      return path.relative(process.cwd(), candidate).split(path.sep).join('/');
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Find the selection in the source. Markdown syntax disappears on the way to HTML,
 * and prose wraps, so a selection routinely spans two source lines and matches
 * neither on its own. Flatten the whole file to one collapsed string, search that,
 * then map the hit back to the lines it covers.
 * @param lines {string[]}
 * @param selection {string}
 * @returns {{from: number, to: number} | null}
 */
function findRange(lines, selection) {
  /** @type {{line: number, start: number, end: number}[]} */
  const spans = [];
  let flat = '';
  lines.forEach((raw, i) => {
    const text = collapse(raw);
    if (!text) return;
    if (flat) flat += ' ';
    spans.push({line: i + 1, start: flat.length, end: flat.length + text.length});
    flat += text;
  });

  const hay = flat.toLowerCase();
  const needle = collapse(selection).toLowerCase();
  if (!needle) return null;

  const probes = [needle];
  for (const size of [80, 50, 30]) {
    if (needle.length > size) probes.push(needle.slice(0, size));
  }

  for (const probe of probes) {
    const at = hay.indexOf(probe);
    if (at < 0) continue;
    const stop = at + probe.length;
    const first = spans.find(s => s.end > at);
    const last = spans.filter(s => s.start < stop).pop();
    if (first && last) return {from: first.line, to: Math.max(first.line, last.line)};
  }
  return null;
}

// Some pages are rendered from data rather than prose. A comment on that text belongs in
// the data file, not in the template that laid it out.
const DATA_PAGES = [
  {page: '/develop/caniuse', dir: 'src/views/develop/caniuse/features', ext: '.yaml'}
];

/**
 * Search the data behind a generated page for the selection.
 * @param pagePath {string}
 * @param selection {string}
 * @returns {{source: string, lines: string[], range: {from: number, to: number}} | null}
 */
function dataSourceOf(pagePath, selection) {
  const clean = pagePath.replace(/\/+$/, '').replace(/\/index\.html$/, '');
  const entry = DATA_PAGES.find(d => d.page === clean);
  if (!entry || !collapse(selection) || !fs.existsSync(entry.dir)) return null;
  for (const name of fs.readdirSync(entry.dir).filter(f => f.endsWith(entry.ext)).sort()) {
    const source = `${entry.dir}/${name}`;
    const lines = fs.readFileSync(source, 'utf8').split(/\r?\n/);
    const range = findRange(lines, selection);
    if (range) return {source, lines, range};
  }
  return null;
}

/**
 * A diff style hunk so the suggestion carries its own context. Every line the
 * selection covers is marked.
 * @param lines {string[]}
 * @param range {{from: number, to: number} | null}
 * @param source {string}
 */
function hunk(lines, range, source) {
  if (!range) return '';
  const from = Math.max(1, range.from - CONTEXT_LINES);
  const to = Math.min(lines.length, range.to + CONTEXT_LINES);
  const body = [];
  for (let n = from; n <= to; n++) {
    const mark = n >= range.from && n <= range.to ? '>' : ' ';
    body.push(`${mark} ${String(n).padStart(4)} | ${lines[n - 1]}`);
  }
  return `@@ ${source}:${from},${to} @@\n${body.join('\n')}`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1e6) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

/**
 * Only suggestions still marked open are pending. Anything dealt with keeps its
 * text on disk, so applying one never destroys what was written.
 * @returns {string[]} filenames, sorted
 */
function openFiles() {
  if (!fs.existsSync(SUGGEST_DIR)) return [];
  return fs.readdirSync(SUGGEST_DIR)
    .filter(f => f.endsWith('.md') && statusOf(f) === 'open')
    .sort();
}

/** @returns {number} */
function openCount() {
  return openFiles().length;
}

/**
 * @param payload {Record<string, string>}
 * @param stamp {string}
 * @returns {{file: string, source: string | null, line: number}}
 */
function write(payload, stamp) {
  const region = payload.region || 'content';
  let source = region === 'sidebar'
    ? sidebarOf(payload.page || '/')
    : sourceOf(payload.page || '/');
  let range = null;
  let context = '';
  if (source && fs.existsSync(source)) {
    const lines = fs.readFileSync(source, 'utf8').split(/\r?\n/);
    range = findRange(lines, payload.selection || '');
    context = hunk(lines, range, source);
  }

  // The template held no such text, so try the data the page was built from.
  if (!range && region !== 'sidebar') {
    const data = dataSourceOf(payload.page || '/', payload.selection || '');
    if (data) {
      source = data.source;
      range = data.range;
      context = hunk(data.lines, data.range, data.source);
    }
  }
  const where = range ? (range.from === range.to ? `${range.from}` : `${range.from}-${range.to}`) : '';

  // Nothing selected means the comment is about the page as a whole.
  const whole = !collapse(payload.selection || '');
  const slug = collapse(payload.selection || 'whole page').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'whole-page';
  const name = `${stamp}-${slug}.md`;

  const doc = [
    '---',
    `page: ${payload.page || ''}`,
    `region: ${region}`,
    `source: ${source || 'UNRESOLVED'}`,
    `lines: ${whole ? 'WHOLE PAGE' : where || 'NOT FOUND'}`,
    `heading: ${payload.headingText || ''}`,
    `anchor: ${payload.headingId || ''}`,
    '---',
    '',
    '## Comment',
    '',
    payload.comment || '',
    ''
  ].concat(whole ? [
    '_No selection. The comment is about the page as a whole._',
    ''
  ] : [
    '## Selected text',
    '',
    payload.selection.split('\n').map(l => `> ${l}`).join('\n'),
    '',
    '## Source context',
    '',
    context ? '```\n' + context + '\n```' : '_Selection not located in the source._',
    '',
    '## Surrounding page text',
    '',
    '```',
    `before: ...${collapse(payload.before || '')}`,
    `after:  ${collapse(payload.after || '')}...`,
    '```',
    ''
  ]).join('\n');

  fs.mkdirSync(SUGGEST_DIR, {recursive: true});
  fs.writeFileSync(path.join(SUGGEST_DIR, name), doc, 'utf8');
  return {file: name, source, lines: where};
}

/**
 * webpack-dev-server setupMiddlewares hook.
 * @param middlewares {any[]}
 * @returns {any[]}
 */
export default function suggestMiddleware(middlewares) {
  middlewares.unshift({
    name: 'suggest-client',
    path: '/__suggest/client.js',
    middleware: (req, res) => {
      res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(fs.readFileSync(path.join(here, 'client.js'), 'utf8'));
    }
  });

  middlewares.unshift({
    name: 'suggest-status',
    path: '/__suggest/status',
    middleware: (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({open: openCount()}));
    }
  });

  middlewares.unshift({
    name: 'suggest-events',
    path: '/__suggest/events',
    middleware: (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive'
      });
      // Node holds the headers back until the first write. With nothing open yet that can
      // be half an hour, and the client cannot tell the stream apart from a hung connect.
      res.flushHeaders();

      fs.mkdirSync(SUGGEST_DIR, {recursive: true});
      const seen = new Set();

      // Replay what is already open, so a watcher armed late still sees the backlog.
      const send = name => {
        if (seen.has(name)) return;
        seen.add(name);
        res.write(`data: ${name}\n\n`);
      };
      for (const f of openFiles()) send(f);

      // fs.watch fires more than once per write on some platforms. `seen` absorbs that.
      // A status update rewrites the file too, so only announce ones still open.
      const watcher = fs.watch(SUGGEST_DIR, (_event, name) => {
        if (!name || !name.endsWith('.md')) return;
        if (openFiles().includes(name)) send(name);
      });

      // Without traffic the socket can be dropped by an idle timeout.
      const beat = setInterval(() => res.write(': ping\n\n'), 30000);

      req.on('close', () => {
        watcher.close();
        clearInterval(beat);
      });
    }
  });

  middlewares.unshift({
    name: 'suggest-save',
    path: '/__suggest/save',
    middleware: async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end('POST only');
      }
      try {
        const payload = JSON.parse(await readBody(req));
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('Z', '');
        const saved = write(payload, stamp);
        // eslint-disable-next-line no-console
        console.log(`[suggest] ${saved.file} -> ${saved.source || '?'}:${saved.lines || '?'}`);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(saved));
      } catch (err) {
        res.statusCode = 400;
        res.end(String(err && err.message ? err.message : err));
      }
    }
  });

  return middlewares;
}
