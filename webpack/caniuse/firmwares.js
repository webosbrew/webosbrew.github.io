import {readdir, readFile} from "fs/promises";
import path from "path";
import * as semver from "semver";
import {findKey, mapValues, uniqBy} from "lodash-es";
import escapeStringRegexp from 'escape-string-regexp';

/**
 * @typedef {import('semver').SemVer} SemVer
 */

/**
 * @typedef {import('../../src/views/develop/caniuse/types').WebOSMajor} WebOSMajor
 */

/**
 * @typedef {Object} FirmwareData
 * @interface
 * @property {WebOSMajor} major
 * @property {Record<string, string>} index
 * @property {Record<string, SemVer>} packages
 */

/**
 * @implements {FirmwareData}
 */
export class Firmware {

  /**
   *
   * @param dataDir {string}
   * @param version {SemVer}
   * @param data {FirmwareData}
   */
  constructor(dataDir, version, data) {
    this.dataDir = dataDir;
    this.version = version;
    this.data = data;
  }

  /**
   *
   * @return {WebOSMajor}
   */
  get major() {
    return this.data.major;
  }

  /**
   *
   * @return {Record<string, string>}
   */
  get index() {
    return this.data.index;
  }

  /**
   *
   * @return {Record<string, SemVer>}
   */
  get packages() {
    return this.data.packages;
  }

  /**
   *
   * @param lib {string}
   * @return {Promise<SemVer>}
   */
  async libVersion(lib) {
    if (lib.includes('*')) {
      const regex = new RegExp(`^${escapeStringRegexp(lib).replace(/\\\*/g, '.*')}$`);
      const matched = findKey(this.index, (_v, k) => {
        return regex.test(k);
      });
      if (!matched) {
        throw new Error(`Library not found: ${lib}`);
      }
      return this.libVersion(matched);
    }
    const libJson = this.index[lib];
    if (!libJson) {
      throw new Error(`Library not found: ${lib}`);
    }
    /** @type {{package: string}} */
    const libInfo = await readFile(path.join(this.dataDir, libJson), 'utf-8').then(JSON.parse);
    return this.packageVersion(libInfo.package);
  }

  /**
   *
   * @param pkg {string}
   * @return {Promise<SemVer>}
   */
  async packageVersion(pkg) {
    const pkgInfo = this.packages[pkg] || this.packages[`lib32-${pkg}`];
    if (!pkgInfo) {
      throw new Error(`Package not found: ${pkg}`);
    }
    return pkgInfo;
  }

  /**
   *
   * @return {Promise<Firmware[]>}
   */
  static async load() {
    const dataRoot = process.env.WEBOSBREW_DEV_TOOLBOX_DATA;
    if (!dataRoot) {
      return [];
    }
    const firmwares = await Promise.all((await readdir(dataRoot)).map(async d => {
      const dataDir = path.join(dataRoot, d);
      /** @type {{release: string}} */
      const info = await readFile(path.join(dataDir, "info.json"), 'utf-8').then(JSON.parse);
      /** @type {Record<string, {version: {upstream: string}}>} */
      const packages = await readFile(path.join(dataDir, "packages.json"), 'utf-8').then(JSON.parse);
      const version = semver.parse(info.release);
      return new Firmware(dataDir, version, {
        major: this.majorFromRelease(version),
        index: await readFile(path.join(dataDir, "index.json"), 'utf-8').then(JSON.parse),
        packages: mapValues(packages, /**@param p {{version:{upstream:string}}} */p => {
          return semver.coerce(p.version.upstream);
        })
      });
    }));
    firmwares.sort((a, b) => b.version.compare(a.version));
    return uniqBy(firmwares, (f) => f.major).sort((a, b) => a.version.compare(b.version));
  }

  /**
   *
   * @param version {SemVer}
   * @return {string}
   */
  static majorFromRelease(version) {
    const {major, minor} = version;
    switch (major) {
      case 1:
        return 'afro';
      case 2:
        return 'beehive';
      case 3:
        return minor < 5 ? 'dreadlocks' : 'dreadlocks2';
      case 4:
        return minor < 5 ? 'goldilocks' : 'goldilocks2';
      case 5:
        return 'jhericurl';
      case 6:
        return 'kisscurl';
      case 7:
        return 'mullet';
      case 8:
        return 'number1';
      case 9:
        return 'ombre';
      case 10:
        return 'ponytail';
      default:
        throw new Error(`Unknown major version: ${major}`);
    }
  }
}