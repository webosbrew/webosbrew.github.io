import {visit} from "unist-util-visit";
import {trimEnd} from "lodash-es";

/**
 *
 * @param a {string}
 * @param b {string}
 * @return {boolean}
 */
export function urlMatches(a, b) {
  return trimEnd(a, '/') === trimEnd(b, '/');
}

/**
 * @param active{string}
 * @return {Processor}
 */
export function rehypeLinkActive({active}) {
  /** @param e {Element} */
  function linkMatches(e) {
    const href = e.tagName === 'a' && e.properties?.href;
    if (!href) {
      return false;
    }
    return urlMatches(href, active);
  }

  return (tree) => {
    visit(tree, linkMatches, /**@param e{Element}*/(e) => {
      e.properties.className = 'active';
    });
  };
}