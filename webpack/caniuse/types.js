/**
 * @typedef {import('../../src/views/develop/caniuse/types').WebOSMajor} WebOSMajor
 */
/**
 * @typedef {Object} CanIUseFeature
 * @interface
 * @property {string} name
 * @property {string} [warning]
 * @property {Record<WebOSMajor, string>} [version_override]
 * @property {string} [documentation]
 * @property {string[]} tags
 */

/**
 * @typedef {Object} CanIUsePackage
 * @interface
 * @extends {CanIUseFeature}
 * @property {string|string[]} package
 */

/**
 * @typedef {Object} CanIUseLibrary
 * @interface
 * @extends {CanIUseFeature}
 * @property {string|string[]} library
 */
