import {remark} from 'remark';
import remarkGfm from 'remark-gfm';
import {remarkAlert} from 'remark-github-blockquote-alert';
import remarkSectionize from 'remark-sectionize';
import remarkGemoji from 'remark-gemoji';
import remarkRehype from 'remark-rehype';

import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

import {visit} from 'unist-util-visit';
import {capitalize} from 'lodash-es';
import extractMeta from "./extract-meta.js";

/** @typedef {import('hast').Root} Root */

/** @typedef {import('hast').Element} Element */

/**
 * @typedef {Function} Processor
 * @param {Root} tree
 * @param {import('vfile').VFile} [vfile]
 */

/** @returns {Processor} */
function flattenTopSection() {
  return (tree) => {
    if (tree.children?.length === 1 && tree.children[0].tagName === 'section') {
      tree.children = tree.children[0].children;
    }
  };
}

/** @returns {Processor} */
function moveSlugToSection() {
  return (tree) => {
    visit(tree, node => node.tagName === 'section', (node) => {
      const firstChild = node.children[0];
      if (firstChild?.tagName?.match(/h[1-6]/)) {
        node.properties.id = firstChild.properties.id;
        delete firstChild.properties.id;
      }
    });
  };
}

/** @returns {Processor} */
function autoLead() {
  return (tree) => {
    if (tree.children[0]?.tagName === 'h1' && tree.children[1]?.tagName === 'p') {
      tree.children[1].properties.className = 'lead';
    }
  };
}

/** @returns {Processor} */
function headingHr() {
  return (tree) => {
    visit(tree, node => node.tagName?.match(/h[1-2]/), (node, index, parent) => {
      let hrIndex = index + 1;
      if (parent.children[hrIndex]?.tagName === 'p' && parent.children[hrIndex]?.properties?.className === 'lead') {
        hrIndex += 1;
      }
      parent.children.splice(hrIndex, 0, {type: 'element', tagName: 'hr'});
    });
  };
}

/** @returns {Processor} */
function blockQuoteStyle() {
  return (tree) => {
    visit(tree, node => node.tagName === 'blockquote', (node) => {
      node.properties.className = 'blockquote';
    });
  };
}


function alertRestyle() {
  return (tree) => {
    visit(tree, node => node.data?.hProperties?.['class']?.includes('markdown-alert'), (node) => {
      let calloutClass = node.data.hProperties['class'].replaceAll('markdown-alert', 'callout');
      if (calloutClass.includes('callout-title')) {
        let textNode = node.children.find(child => child.type === 'text');
        textNode.value = capitalize(textNode.value);
      } else {
        calloutClass += ' my-3';
      }
      node.data.hProperties['class'] = calloutClass;
    });
  };
}

/** @type {import('unified').Processor} */
const parser = remark()
  .use(remarkGfm)
  .use([remarkAlert, alertRestyle])
  .use(remarkSectionize)
  .use(remarkGemoji)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(flattenTopSection)
  .use(moveSlugToSection)
  .use(autoLead)
  .use(headingHr)
  .use(blockQuoteStyle)
  .use(extractMeta)
  .use(rehypeStringify, {allowDangerousCharacters: true, allowDangerousHtml: true});

/**
 * @this {import('webpack').LoaderContext}
 * @param source {string}
 */
// noinspection JSUnusedGlobalSymbols
export default async function (source) {
  let result = await parser.process(source);
  return {
    content: result.value,
    meta: result.data
  };
}