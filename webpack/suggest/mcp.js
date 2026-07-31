#!/usr/bin/env node
// MCP server over stdio for the suggestion dropbox. The only supported way to touch
// .suggestions/ — see CLAUDE.md. Deliberately has no tool that clears the directory:
// every destructive call names exactly one file.
//
// Runs standalone, not as part of the build, so restarting the dev server does not
// disturb it.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {STATUSES, baseOf, nameFor, statusOf} from './naming.js';

const DIR = path.resolve(process.env.SUGGEST_DIR || '.suggestions');

/** @param name {string} @returns {string} the file as it is spelled on disk */
function onDisk(name) {
  if (typeof name !== 'string' || !name) {
    throw new Error('file is required');
  }
  if (!/^[\w.:-]+\.md$/.test(name)) {
    throw new Error(`not a suggestion filename: ${name}`);
  }
  if (path.dirname(path.resolve(DIR, name)) !== DIR) {
    throw new Error(`outside the suggestions directory: ${name}`);
  }
  if (fs.existsSync(path.resolve(DIR, name))) return name;
  // A status change renames the file, so accept the name it was written under too.
  const match = listFiles().find(f => baseOf(f) === baseOf(name));
  if (!match) {
    throw new Error(`no such suggestion: ${name}`);
  }
  return match;
}

/** @param name {string} @returns {string} absolute path, guaranteed inside DIR */
function resolveName(name) {
  return path.resolve(DIR, onDisk(name));
}

function listFiles() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter(f => f.endsWith('.md')).sort();
}

/** @param text {string} */
function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const at = line.indexOf(':');
    if (at > 0) out[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return out;
}

function summarise(name) {
  const text = fs.readFileSync(path.join(DIR, name), 'utf8');
  const fm = frontmatter(text);
  const body = text.split('## Comment')[1] || '';
  const comment = body.split('\n').map(l => l.trim()).filter(Boolean)[0] || '';
  return {
    file: name,
    status: statusOf(name),
    page: fm.page || '',
    region: fm.region || 'content',
    source: fm.source || '',
    lines: fm.lines || '',
    heading: fm.heading || '',
    comment: comment.length > 120 ? comment.slice(0, 120) + '…' : comment
  };
}

const TOOLS = [
  {
    name: 'suggest_list',
    description: 'List edit suggestions with their status, target file and a one line preview. Use this instead of reading the .suggestions directory.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {type: 'string', description: `Filter by status, one of ${STATUSES.join(', ')}. Omit for all.`}
      }
    }
  },
  {
    name: 'suggest_read',
    description: 'Read one suggestion in full, including the comment, the selected text and the source context.',
    inputSchema: {
      type: 'object',
      properties: {file: {type: 'string', description: 'Filename as returned by suggest_list'}},
      required: ['file']
    }
  },
  {
    name: 'suggest_update_status',
    description: `Set the status of one suggestion, by renaming it. ${STATUSES.join(', ')}. Anything other than open stops it counting as pending, and keeps the text on disk. Use this for suggestions you did not apply; delete the ones you did.`,
    inputSchema: {
      type: 'object',
      properties: {
        file: {type: 'string', description: 'Filename as returned by suggest_list'},
        status: {type: 'string', description: STATUSES.join(', ')},
        note: {type: 'string', description: 'Optional line recording what was done'}
      },
      required: ['file', 'status']
    }
  },
  {
    name: 'suggest_delete',
    description: 'Delete one suggestion, named exactly. Right once you have applied the edit. For anything you did not apply use suggest_update_status, which keeps the text. There is no tool that deletes more than one.',
    inputSchema: {
      type: 'object',
      properties: {file: {type: 'string', description: 'Filename as returned by suggest_list'}},
      required: ['file']
    }
  }
];

function call(name, args) {
  args = args || {};
  if (name === 'suggest_list') {
    const all = listFiles().map(summarise);
    const rows = args.status ? all.filter(s => s.status === args.status) : all;
    if (!rows.length) return 'No suggestions.';
    return JSON.stringify(rows, null, 1);
  }
  if (name === 'suggest_read') {
    return fs.readFileSync(resolveName(args.file), 'utf8');
  }
  if (name === 'suggest_update_status') {
    if (!STATUSES.includes(args.status)) {
      throw new Error(`status must be one of ${STATUSES.join(', ')}`);
    }
    const from = onDisk(args.file);
    const to = nameFor(from, args.status);
    if (args.note) {
      fs.appendFileSync(path.resolve(DIR, from), `\n## Note\n\n${args.note.replace(/\n/g, ' ')}\n`, 'utf8');
    }
    if (to !== from) {
      fs.renameSync(path.resolve(DIR, from), path.resolve(DIR, to));
    }
    return `${from} is now ${args.status}, filed as ${to}`;
  }
  if (name === 'suggest_delete') {
    const full = resolveName(args.file);
    fs.unlinkSync(full);
    return `deleted ${args.file}`;
  }
  throw new Error(`unknown tool: ${name}`);
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

readline.createInterface({input: process.stdin}).on('line', (line) => {
  if (!line.trim()) return;
  let req;
  try {
    req = JSON.parse(line);
  } catch (e) {
    return;
  }
  const {id, method, params} = req;
  const reply = (result) => id !== undefined && send({jsonrpc: '2.0', id, result});

  try {
    if (method === 'initialize') {
      reply({
        protocolVersion: params?.protocolVersion || '2024-11-05',
        capabilities: {tools: {}},
        serverInfo: {name: 'suggest', version: '1.0.0'}
      });
    } else if (method === 'tools/list') {
      reply({tools: TOOLS});
    } else if (method === 'tools/call') {
      const text = call(params?.name, params?.arguments);
      reply({content: [{type: 'text', text: String(text)}]});
    } else if (method === 'ping') {
      reply({});
    } else if (id !== undefined) {
      send({jsonrpc: '2.0', id, error: {code: -32601, message: `unknown method: ${method}`}});
    }
  } catch (err) {
    if (id !== undefined) {
      send({jsonrpc: '2.0', id, result: {content: [{type: 'text', text: `Error: ${err.message}`}], isError: true}});
    }
  }
});
