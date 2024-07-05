import {visit} from "unist-util-visit";
import {toHtml} from "hast-util-to-html";
import htm from "htm";
import {kebabCase} from "lodash-es";

/** @typedef {import('mdast').Code} Code */
/** @typedef {Code & {tab: string, tabId: string}} TabbedCode */
/** @typedef {import('mdast').Html} Html */

/** @typedef {import('hast').Root} Root */

/** @typedef {import('hast').Element} Element */

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
 * @typedef {Function} Processor
 * @param {Root} tree
 * @param {import('vfile').VFile} [vfile]
 */

/** @returns {Processor} */
export default function tabbedCodeBlock() {


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

  /** @param {Code|undefined} node */
  function isTabbedCodeBlock(node) {
    return node?.type === 'code' && node.meta;
  }

  return (tree) => {
    visit(tree, isTabbedCodeBlock,
      /**
       * @param node {Code}
       * @param index {number}
       * @param parent {Element}
       */
      (node, index, parent) => {
        node['tab'] = node.meta;
        node['tabId'] = kebabCase(node.meta.replaceAll(/[^\w\s]+/g, (s) => `u${s.charCodeAt(0).toString(16)}`));
        if (isTabbedCodeBlock(parent.children[index + 1])) {
          return;
        }
        const firstTab = parent.children.findIndex((child) => child['tab']);
        /** @type {Html} */
        const elem = {type: 'html'};
        /** @type {TabbedCode[]} */
        const tabs = parent.children.splice(firstTab, index - firstTab + 1, elem);
        const prefix = `code-${tabs[0].position?.start?.offset}`;
        elem.value = toHtml(html`
          <div>
            <ul class="nav nav-tabs" role="tablist">
              ${tabs.map((tab, index) => {
                const tabId = `${prefix}-${tab.tabId}-tab`;
                const paneId = `${prefix}-${tab.tabId}-pane`;
                return html`
                  <li class="nav-item" role="presentation">
                    <button class="nav-link ${index === 0 ? 'active' : ''}" type="button" role="tab" id=${tabId}
                            data-bs-toggle="tab" data-bs-target="#${paneId}" aria-controls=${paneId}
                            aria-selected="${index === 0}">${tab.tab}
                    </button>
                  </li>`;
              })}
            </ul>
            <div class="tab-content bg-dark border-start border-end border-bottom rounded-bottom">
              ${tabs.map((tab, index) => {
                const tabId = `${prefix}-${tab.tabId}-tab`;
                const paneId = `${prefix}-${tab.tabId}-pane`;
                return html`
                  <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" id=${paneId} role="tabpanel"
                       aria-labelledby=${tabId} tabindex="0">
                    <pre class="p-3 mb-0"><code class="lang-${tab.lang}">${tab.value}</code></pre>
                  </div>`;
              })}
            </div>
          </div>`
        );
      });
  };
}