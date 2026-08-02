import {Firmware} from "./firmwares.js";
import {readdir, readFile} from "fs/promises";
import YAML from "yaml";
import path from "path";
import {remark} from "remark";
import remarkGfm from "remark-gfm";
import remarkBootstrapIcon from "../remark/bootstrap-icon.js";
import remarkGemoji from "remark-gemoji";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug-custom-id";
import rehypeHighlight from "rehype-highlight";
import {all} from "lowlight";
import rehypeStringify from "rehype-stringify";

const remarkParser = remark()
  .use(remarkGfm)
  .use(remarkBootstrapIcon)
  .use(remarkGemoji)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeRaw)
  .use(rehypeSlug, {enableCustomId: true})
  .use(rehypeHighlight, {languages: all})
  .use(rehypeStringify, {allowDangerousCharacters: true, allowDangerousHtml: true});

// Keep in step with allVersions in src/views/develop/caniuse/card.ts.
const MAJORS = [
  {major: 'afro', name: '1.x'},
  {major: 'beehive', name: '2.x'},
  {major: 'dreadlocks', name: '3.0~3.4'},
  {major: 'dreadlocks2', name: '3.5~3.9'},
  {major: 'goldilocks', name: '4.0~4.4'},
  {major: 'goldilocks2', name: '4.5~4.10'},
  {major: 'jhericurl', name: '5.x'},
  {major: 'kisscurl', name: '6.x'},
  {major: 'mullet', name: '7.x'},
  {major: 'number1', name: '8.x'},
  {major: 'ombre', name: '9.x'},
  {major: 'ponytail', name: '10.x'},
  {major: 'queue', name: '11.x'}
];

const CANIUSE_HTML = 'develop/caniuse/index.html';

// The page renders itself from JSON in the browser, so anything that fetches the URL without
// running scripts, a crawler or a language model, finds an empty container. Say what the page
// holds and point at the data. Inlining the whole table would work too, but it costs every
// real visitor a payload none of them render.
const NOSCRIPT = [
  '<noscript>',
  '<p>This page lists which webOS releases carry a given library or runtime, and at what',
  ' version. It builds the table in the browser, so there is nothing here without',
  ' JavaScript.</p>',
  '<p>The same data, complete, in one file:',
  ' <a href="/develop/caniuse/data/all.json">/develop/caniuse/data/all.json</a>.</p>',
  '</noscript>'
].join('\n');

/**
 * @typedef {import('../../src/views/develop/caniuse/types.js').DataEntry} DataEntry
 */
export default class CanIUseDataGenPlugin {

  /**
   * @param options {{
   *   input: string,
   * }}
   */
  constructor(options) {
    this.input = options.input;
  }

  /**
   * @type {import('webpack').WebpackPluginFunction}
   */
  // noinspection JSUnusedGlobalSymbols
  apply(compiler) {
    const pluginName = 'CanIUseDataGenPlugin';
    const {webpack} = compiler;
    const {Compilation} = webpack;
    const {RawSource} = webpack.sources;
    compiler.hooks.compilation.tap(pluginName, (compilation) => compilation.hooks.processAssets.tapPromise({
      name: pluginName,
      stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
    }, async () => {
      const input = this.input;
      const output = './develop/caniuse/data';

      const firmwares = await Firmware.load();
      /** @type {Record<string, string[]>} */
      const index = {};
      /** @type {DataEntry[]} */
      const all = [];
      for (const f of await readdir(input)) {
        /** @type {CanIUsePackage|CanIUseFeature} */
        const feature = YAML.parse(await readFile(path.join(input, f), 'utf8'));
        /** @type {DataEntry} */
        const entry = {
          name: feature.name,
          versions: {},
        };
        if (feature.warning) {
          entry.warning = String(await remarkParser.process(feature.warning));
        }
        if (feature.documentation) {
          entry.documentation = feature.documentation;
        }
        for (let firmware of firmwares) {
          const override = feature.version_override && (firmware.major in feature.version_override ?
            feature.version_override?.[firmware.major] : feature.version_override?.default);
          const version = override || (await featureVersion(feature, firmware))?.format();
          if (version) {
            entry.versions[firmware.major] = version;
          }
        }
        const key = path.basename(f, path.extname(f));
        compilation.emitAsset(`${output}/${key}.json`, new RawSource(JSON.stringify(entry, null, 2)));
        all.push({id: key, ...entry});
        for (let tag of feature.tags) {
          if (!index[tag]) {
            index[tag] = [];
          }
          index[tag].push(key);
          index[tag].sort();
        }
      }
      compilation.emitAsset(`${output}/index.json`, new RawSource(JSON.stringify(index, null, 2)));

      // Every feature in one file. Saves a reader 20-odd requests, and gives something to
      // point a `link rel=alternate` at.
      all.sort((a, b) => a.id.localeCompare(b.id));
      compilation.emitAsset(`${output}/all.json`, new RawSource(JSON.stringify({
        description: 'Library and runtime versions per webOS release, from webosbrew.org.',
        majors: MAJORS,
        features: all
      }, null, 2)));
    }));

    // Late, so the page HTML is already emitted.
    compiler.hooks.compilation.tap(pluginName, (compilation) => compilation.hooks.processAssets.tap({
      name: `${pluginName}Static`,
      stage: Compilation.PROCESS_ASSETS_STAGE_REPORT
    }, (assets) => {
      const name = Object.keys(assets).find(a => a.replace(/\\/g, '/').endsWith(CANIUSE_HTML));
      if (!name) {
        return;
      }
      const html = compilation.getAsset(name).source.source().toString();
      if (html.includes('<noscript>') || !html.includes('</main>')) {
        return;
      }
      // The head goes in from here too. The shared layout has no head block, and adding one
      // breaks every page that declares no partial: the block helper reads `this._blocks`,
      // which only exists once a page has declared one.
      const head = [
        '<meta name="description" content="Which webOS releases carry a given library or ' +
        'runtime, and at what version.">',
        '<link rel="alternate" type="application/json" href="/develop/caniuse/data/all.json" ' +
        'title="Can I Use data as JSON">'
      ].join('\n');
      compilation.updateAsset(name, new RawSource(html
        .replace('</head>', `${head}\n</head>`)
        .replace('</main>', `${NOSCRIPT}</main>`)));
    }));
  }

}

/**
 *
 * @param feature {CanIUseLibrary|CanIUsePackage}
 * @param firmware {Firmware}
 * @return {Promise<SemVer| null>}
 */
async function featureVersion(feature, firmware) {
  if ('library' in feature) {
    if (Array.isArray(feature.library)) {
      return Promise.allSettled(feature.library.map(lib => firmware.libVersion(lib)))
        .then(versions => versions.find(v => v.status === 'fulfilled')?.value ?? null);
    } else {
      return firmware.libVersion(feature.library).catch(() => null);
    }
  } else if ('package' in feature) {
    if (Array.isArray(feature.package)) {
      return Promise.allSettled(feature.package.map(pkg => firmware.packageVersion(pkg)))
        .then(versions => versions.find(v => v.status === 'fulfilled')?.value ?? null);
    } else {
      return firmware.packageVersion(feature.package).catch(() => null);
    }
  }
  return null;
}