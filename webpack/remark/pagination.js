import {toString as mdToString} from 'mdast-util-to-string';
import {groupBy, mapValues} from "lodash-es";
import {visit} from "unist-util-visit";

import {html} from '../htm-rehype.js';
import {toHtml} from "hast-util-to-html";

/**
 * @param node {MarkdownNode}
 * @returns {MarkdownLink[]}
 */
function extractLinks(node) {
  const result = [];
  if (node) visit(node, 'link', (link) => {
    result.push(link);
  });
  return result;
}

/**
 * @return {Processor}
 */
export default function () {
  return (tree) => {
    /** @type {MarkdownList} */
    const lastChild = tree.children[tree.children.length - 1];
    if (lastChild?.type !== 'list') {
      return;
    }
    /** @type {Record<string, MarkdownLink[]>} */
    const entries = mapValues(groupBy(lastChild.children, i => mdToString(i.children[0])),
      l => l.flatMap(i => extractLinks(i.children[1])));
    const prev = entries['Previous'];
    const next = entries['Next'];
    if (!prev && !next) {
      return;
    }
    tree.children[tree.children.length - 1] = {
      type: 'html',
      value: toHtml(html`
        <div class="row mt-5">
          <div class="col-md-6">
            ${prev && html`
              <div class="card px-3 py-2 align-items-start">
                <small><i class="bi bi-chevron-double-left small"></i> Previous</small>
                ${prev.map(link => html`
                  <a href="${link.url}" class="d-block text-decoration-none">${mdToString(link)}</a>
                `)}
              </div>`}
          </div>
          <div class="col-md-6">
            ${next && html`
              <div class="card px-3 py-2 align-items-end">
                <small>Next <i class="bi bi-chevron-double-right small"></i></small>
                ${next.map(link => html`
                  <a href="${link.url}" class="d-block text-decoration-none">${mdToString(link)}</a>
                `)}
              </div>`}
          </div>
        </div>
      `)
    }
  }
}