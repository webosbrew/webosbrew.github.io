import {visit} from "unist-util-visit";
import {kebabCase, zip} from "lodash-es";
import {toString} from "hast-util-to-string";
import htm from "htm";

/** @typedef {import('hast').Root} Root */

/** @typedef {import('hast').Element} Element */

/**
 * @typedef {Function} Processor
 * @param {Root} tree
 * @param {import('vfile').VFile} [vfile]
 */

/** @returns {Processor} */
export function tabbedCodeBlock() {

  function createElement(type, props, ...children) {
    return {
      type: 'element',
      tagName: type,
      properties: props ?? {},
      children: children.flatMap(child => Array.isArray(child) ? child : [child])
        .map(child => typeof child === 'string' ? {type: 'text', value: child} : child)
    };
  }

  const html = htm.bind(createElement);

  /**
   * @param {Element} node
   * @return {[Element, Element] | null}
   */
  function getTextAndPre(node) {
    if (node.tagName !== 'li' || !node.children) {
      return null;
    }
    let text = null;
    let pre = null;
    for (let child of node.children) {
      if (child.tagName === 'p') {
        text = child;
      } else if (child.tagName === 'pre') {
        pre = child;
      }
    }
    return text && pre && [text, pre];
  }

  /** @param {Element} node */
  function isTabbedCodeBlock(node) {
    if (node.tagName !== 'ul' || node.children.length < 2) {
      return false;
    }
    for (let child of node.children.filter(child => child.type === 'element' && child.tagName === 'li')) {
      if (!getTextAndPre(child)) {
        return false;
      }
    }
    return true;
  }

  return (tree) => {
    visit(tree, isTabbedCodeBlock,
      /**
       * @param node {Element}
       * @param index {number}
       * @param parent {Element}
       */
      (node, index, parent) => {
        const id = node.properties?.id || '';
        const [tabs, panes] = zip(...node.children.map(getTextAndPre).filter((v) => v).map(
          /** @return {[Element, Element]} */
          ([text, pre], index) => {
            let title = toString(text).trim();
            if (title.endsWith(':')) {
              title = title.slice(0, -1);
            }
            const tabId = `${id}-${kebabCase(title)}-tab`;
            const paneId = `${id}-${kebabCase(title)}-pane`;
            return [
              html`
                <li class="nav-item" role="presentation">
                  <button class="nav-link ${index === 0 ? 'active' : ''}" type="button" role="tab" id=${tabId}
                          data-bs-toggle="tab" data-bs-target="#${paneId}" aria-controls=${paneId}
                          aria-selected="${index === 0}">${title}
                  </button>
                </li>`,
              html`
                <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" id=${paneId} role="tabpanel"
                     aria-labelledby=${tabId} tabindex="0">
                  ${pre}
                </div>`
            ];
          }));
        parent.children[index] = html`
          <div id=${id}>
            <ul class="nav nav-tabs" role="tablist">${tabs}</ul>
            <div class="tab-content p-3 bg-dark border-start border-end border-bottom rounded-bottom">${panes}</div>
          </div>`;
      });
  };
}