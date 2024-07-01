import {DeviceModel} from "@webosbrew/caniroot";
import {groupBy, omit} from "lodash-es";
import Handlebars from "handlebars";

/**
 * @typedef {import('@webosbrew/caniroot').DeviceModelData} DeviceModelData
 */

/**
 * @typedef {DeviceModelData & {model:string}} DeviceModelEntry
 */

/**
 * @typedef {{value:string, indices:number[]}} DeviceModelIndexIntry
 */

/**
 * @param models {DeviceModelEntry[]}
 * @param key {keyof DeviceModelEntry}
 * @returns {DeviceModelIndexIntry[]}
 */
function toIndex(models, key) {
  /** @type {Record<string, [number, DeviceModelEntry][]>} */
  const grouped = groupBy(models.map((model, index) => [index, model]),
    ([_index, model]) => model[key]);
  return Object.entries(grouped)
    .map(([value, indices]) => ({value, indices: indices.map(([index]) => index)}))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * @this {import('webpack').LoaderContext}
 * @param source {string}
 */
// noinspection JSUnusedGlobalSymbols
export default function (source) {
  /** @type {DeviceModelEntry[]} */
  const template = Handlebars.compile(source.replaceAll(/\[\/\*([^*]*)\*\/]/g, '{{{$1}}}'));

  /** @type {[string, DeviceModelData][]} */
  const entries = Object.entries(DeviceModel.all);
  const models = entries.flatMap(([key, value]) => {
    const mainModel = {model: key, ...omit(value, 'variants')};
    let variants = [mainModel];
    if (value.variants) {
      variants = variants.concat(value.variants.filter(v => {
        return v.otaId || v.machine || v.codename;
      }).map(v => {
        return ({model: key, ...omit(value, 'variants'), ...v});
      }));
    }
    return variants;
  });
  return template({
    models: JSON.stringify(models),
    indices: {
      machine: JSON.stringify(toIndex(models, 'machine')),
      series: JSON.stringify(toIndex(models, 'series')),
      codename: JSON.stringify(toIndex(models, 'codename')),
      broadcast: JSON.stringify(toIndex(models, 'broadcast')),
      region: JSON.stringify(toIndex(models, 'region')),
      otaId: JSON.stringify(toIndex(models, 'otaId')),
    }
  });
}