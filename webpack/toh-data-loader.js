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
 * @param [transform] {(value: string) => string}
 * @returns {DeviceModelIndexIntry[]}
 */
function toIndex(models, key, transform) {
  /** @type {Record<string, [number, DeviceModelEntry][]>} */
  const grouped = groupBy(models.flatMap((model, index) => {
    const field = model[key];
    if (Array.isArray(field)) {
      return field.map(value => [index, {...model, [key]: value}]);
    }
    return [[index, model]];
  }), ([_index, model]) => transform ? transform(model[key]) : model[key]);
  return Object.entries(grouped)
    .map(([value, indices]) => ({value, indices: indices.map(([index]) => index)}))
    .sort((a, b) => {
      return a.value.localeCompare(b.value, 'en', {numeric: true});
    })
}

/**
 * @this {import('webpack').LoaderContext}
 * @param source {string}
 * @returns {string}
 */
// noinspection JSUnusedGlobalSymbols
export default function (source) {
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
      otaId: JSON.stringify(toIndex(models, 'otaId')),
      screenSize: JSON.stringify(toIndex(models, 'sizes', (value) => `${value}″`)),
      region: JSON.stringify(toIndex(models, 'regions')),
      year: JSON.stringify(toIndex(models, 'otaId', (value) => {
        let year = value.slice(8, 10);
        if (year === 'T1') {
          year = '14';
        }
        return `20${year}`;
      })),
    }
  });
}