import {kebabCase} from "lodash-es";

/**
 *
 * @param title {string}
 * @return {string}
 */
export function idFromTitle(title) {
  return kebabCase(title.replace(/[^\w\s]+/g, (s) => `u${s.charCodeAt(0).toString(16)}`));
}