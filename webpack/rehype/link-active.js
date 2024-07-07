import {visit} from "unist-util-visit";
import {trimEnd} from "lodash-es";

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
    return trimEnd(href, '/') === active;
  }

  return (tree) => {
    visit(tree, linkMatches, /**@param e{Element}*/(e) => {
      e.properties.className = 'active';
    });
  };
}