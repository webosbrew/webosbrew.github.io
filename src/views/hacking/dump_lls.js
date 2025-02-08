const fs = require('fs');
const child_process = require("node:child_process");

/**
 * @typedef {Object} LLSEntry
 * @property {string} llsname
 * @property {number} llsidx
 * @property {string} category
 * @property {Omit<LLSEntry, 'subitems'>[]} [subitems]
 */

/**
 * @type {{lls: Record<string, LLSEntry[]>}}
 */
const optionTable = JSON.parse(fs.readFileSync('/etc/factorymanager/db/optionTable.json', 'utf-8'));

/**
 * @typedef {Object} ExportOption
 * @property {string} key
 * @property {string} name
 * @property {string} type
 */

/**
 * @type {{'export': Record<string, ExportOption[]>}}
 */
const exportTable = JSON.parse(fs.readFileSync('/etc/factorymanager/db/exportOptions.json', 'utf-8'));

/**
 *
 * @param dbid {string}
 * @param llsname {string}
 */
function getLLSValue(dbid, llsname) {
  const buf = child_process.execSync(`luna-send -n 1 -f 'luna://com.webos.service.lowlevelstorage/getData' '{"dbgroups":[{"dbid":"${dbid}","items":["${llsname}"]}]}'`, {encoding: 'utf-8'});
  const data = JSON.parse(buf);
  if (data.returnValue) {
    return `\`${JSON.stringify(data.dbgroups[0].items[llsname])}\``;
  }
  return null;
}

const categoryMapping = {
  'factorydb': 'factory',
  'tv.model': 'factory',
  'system': 'system',
};

/**
 * @param key {string}
 * @returns {ExportOption | null}
 */
function getExportOption(key) {
  for (const groupKey in exportTable.export) {
    for (const entry of exportTable.export[groupKey]) {
      if (entry.key === key) {
        return entry;
      }
    }
  }
  return null;
}

console.log('| Category | LLS Name | Export Option | Example Value |');
console.log('|---|---|---|---|');
for (const groupKey in optionTable.lls) {
  for (const entry of optionTable.lls[groupKey]) {
    const category = categoryMapping[entry.category] || entry.category;
    if (entry.llsname === 'null') {
      continue;
    }
    if (!entry.subitems?.length) {
      console.log('|', category, '|', entry.llsname, '|', getExportOption(entry.llsname)?.name ?? '', '|', getLLSValue(category, entry.llsname), '|');
    } else {
      for (const subitem of entry.subitems) {
        if (!subitem.llsname) {
          continue;
        }
        console.log('|', category, '|', subitem.llsname, '|', getExportOption(subitem.llsname)?.name ?? '', '|', getLLSValue(category, subitem.llsname), '|');
      }
    }
  }
}