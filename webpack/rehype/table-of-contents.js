import {visit} from "unist-util-visit";
import {toString} from "hast-util-to-string";
import {html} from "../htm-rehype.js";

/**
 * @typedef {Object} TocItem
 * @property {string} title
 * @property {string} id
 * @property {number} level
 * @property {TocItem[]} [children]
 */

/**
 * @param tree {Root}
 * @param title {string}
 * @return {TocItem|undefined}
 */
function extractToc(tree, title) {
  const toc = {title, id: '', depth: 1, children: []};
  const children = toc.children;
  let current;
  visit(tree, /**@param node {Element}*/(node) => node.tagName?.match(/h[2-4]/),
    /**
     * @param heading {Element}
     * @param index {number}
     * @param parent {Element}
     */
    (heading, index, parent) => {
      const item = {
        title: toString(heading),
        id: heading.properties.id || parent.properties.id,
        level: heading.tagName.match(/h([1-6])/)[1] - 0
      };
      if (item.level > current?.level) {
        current.children = current.children || [];
        current.children.push(item);
      } else {
        children.push(item);
        current = item;
      }
    });
  if (children.length === 0) {
    return undefined;
  }
  return toc;
}

/**
 * @return {Processor}
 */
export function extractMeta() {
  return (tree, vfile) => {
    if (tree.children[0]?.tagName === 'h1') {
      vfile.data.title = toString(tree.children[0]);
    }
    vfile.data.toc = extractToc(tree, vfile.data.title);
  };
}

/**
 * @return {Processor}
 */
export function tocDropdown() {
  return (tree, vfile) => {
    if (!vfile.data.toc) {
      return;
    }
    /** @type {Element[]} */
    const children = tree.children;
    const firstHr = children.findIndex((node) => node.tagName === 'hr');
    if (!firstHr) {
      return;
    }
    /** @type {TocItem} */
    const toc = vfile.data.toc;
    const intro = children.splice(0, firstHr + 1);
    const content = children.splice(0, children.length);
    children.push(...html`
      <div class="page-intro pe-md-3">${intro}</div>
      <div class="page-toc">
        <button class="form-select text-start d-md-none" type="button" data-bs-toggle="collapse"
                data-bs-target="#toc-nav">
          On this page
        </button>
        <strong class="mx-3 h6 d-none d-md-block">On this page</strong>
        <hr class="mx-3 d-none d-md-block"/>
        <nav id="toc-nav" class="collapse ms-md-1 mt-3 mt-md-0 p-3 p-md-0 border rounded">
          <ul class="list-unstyled small my-0">
            ${toc.children.map((item) => html`
              <li>
                <a class="d-block text-decoration-none ps-md-2" href="#${item.id}">${item.title}</a>
                ${item.children?.length > 0 && html`
                  <ul class="list-unstyled">
                    ${item.children.map((child) => html`
                      <li>
                        <a class="d-block text-decoration-none ps-2 ps-md-3" href="#${child.id}">${child.title}</a>
                      </li>
                    `)}
                  </ul>
                `}
              </li>
            `)}
          </ul>
        </nav>
      </div>
      <div class="page-content mt-3 mt-md-0 pe-md-3">${content}</div>
    `)
  };
}