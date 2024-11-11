import {visit} from "unist-util-visit";
import {toHtml} from "hast-util-to-html";
import {kebabCase} from "lodash-es";
import {html} from "../htm-rehype.js";

/** @typedef {Code & {tab: string, tabId: string}} TabbedCode */

/** @returns {Processor} */
export default function tabbedCodeBlock() {
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
        const tabs = parent.children.slice(firstTab, index + 1);
        const prefix = `code-${tabs[0].position?.start?.offset}`;
        elem.value = toHtml(html`
          <div class="tabbed-code-blocks">
            <ul class="nav nav-tabs" role="tablist">
              ${tabs.map((tab, index) => {
                const tabId = `${prefix}-${tab.tabId}-tab`;
                const paneId = `${prefix}-${tab.tabId}-pane`;
                return html`
                  <li class="nav-item text-nowrap" role="presentation">
                    <button class="nav-link ${index === 0 ? 'active' : ''}" type="button" role="tab" id=${tabId}
                            data-bs-toggle="tab" data-bs-target="#${paneId}" aria-controls=${paneId}
                            aria-selected="${index === 0}">${tab.tab}
                    </button>
                  </li>`;
              })}
            </ul>
            <div class="tab-content border-start border-end border-bottom rounded-bottom mb-3">
              ${tabs.map((tab, index) => {
                const tabId = `${prefix}-${tab.tabId}-tab`;
                const paneId = `${prefix}-${tab.tabId}-pane`;
                return html`
                  <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" id=${paneId} role="tabpanel"
                       aria-labelledby=${tabId} tabindex="0">
                    <pre class="m-0"><code class="lang-${tab.lang}">${tab.value}</code></pre>
                  </div>`;
              })}
            </div>
          </div>`
        );

        parent.children.fill({value: ''}, firstTab, index);
        parent.children[index] = elem;
      });
  };
}