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
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import {all} from "lowlight";
import rehypeStringify from "rehype-stringify";

const remarkParser = remark()
  .use(remarkGfm)
  .use(remarkBootstrapIcon)
  .use(remarkGemoji)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeHighlight, {languages: all})
  .use(rehypeStringify, {allowDangerousCharacters: true, allowDangerousHtml: true});

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
          const version = override !== undefined ? override : (await featureVersion(feature, firmware))?.format();
          if (version) {
            entry.versions[firmware.major] = version;
          }
        }
        const key = path.basename(f, path.extname(f));
        compilation.emitAsset(`${output}/${key}.json`, new RawSource(JSON.stringify(entry, null, 2)));
        for (let tag of feature.tags) {
          if (!index[tag]) {
            index[tag] = [];
          }
          index[tag].push(key);
          index[tag].sort();
        }
      }
      compilation.emitAsset(`${output}/index.json`, new RawSource(JSON.stringify(index, null, 2)));
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