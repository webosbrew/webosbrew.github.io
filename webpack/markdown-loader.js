import {remark} from 'remark';
import remarkGfm from 'remark-gfm';
import {remarkAlert} from 'remark-github-blockquote-alert';
import remarkSectionize from 'remark-sectionize';
import remarkGemoji from 'remark-gemoji';
import remarkRehype from 'remark-rehype';
import remarkTabbedCodeBlock from "./remark/tabbed-code-block.js";
import remarkImageClass from "./remark/image-class.js";
import remarkPagination from "./remark/pagination.js";

import rehypeRaw from 'rehype-raw';
// Drop-in for rehype-slug that also reads `{#custom-id}` out of the heading text. Same
// stage, same result for a heading without one. It has to stay a markdown heading though:
// write the heading as raw HTML instead and remark-sectionize, which runs earlier and only
// sees markdown, will not open a section for it, so the section before swallows it whole.
import rehypeSlug from 'rehype-slug-custom-id';
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from 'rehype-stringify';
import {extractMeta, tocDropdown} from "./rehype/table-of-contents.js";
import imgOptimize from "./rehype/img-optimize.js";

import {all} from 'lowlight'
import {visit} from 'unist-util-visit';
import {capitalize} from 'lodash-es';
import remarkBootstrapIcon from "./remark/bootstrap-icon.js";

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
    visit(tree, node => node.tagName?.match(/h[1-2]/),
      /**
       * @param _node {Element}
       * @param index {number}
       * @param parent {Element}
       */
      (_node, index, parent) => {
        let hrIndex = index + 1;
        if (parent.children[hrIndex]?.tagName === 'p' && parent.children[hrIndex]?.properties?.className === 'lead') {
          hrIndex += 1;
        }
        if (parent.children?.[hrIndex]?.tagName === 'hr') {
          return;
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

function wrapTable() {
  return (tree) => {
    visit(tree, /** @param node {Element} */node => node.tagName === 'table',
      /**
       * @param node {Element}
       * @param index {number}
       * @param parent {Element}
       */
      (node, index, parent) => {
        if (parent.tagName === 'div' && parent.properties.className?.includes('table-responsive')) {
          return;
        }
        node.properties.className = 'table';
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: {className: 'table-responsive'},
          children: [node]
        };
      });
  };

}

/**
 * remark-github-blockquote-alert writes `className`, either as a string or as an
 * array of strings. Flatten it to one space separated string.
 * @param props {Record<string, any> | undefined}
 * @returns {string}
 */
function alertClassName(props) {
  const className = props?.['className'] ?? props?.['class'];
  return Array.isArray(className) ? className.join(' ') : className ?? '';
}

function alertRestyle() {
  return (tree) => {
    visit(tree, node => alertClassName(node.data?.hProperties).includes('markdown-alert'), (node) => {
      let calloutClass = alertClassName(node.data.hProperties).replaceAll('markdown-alert', 'callout');
      if (calloutClass.includes('callout-title')) {
        let textNode = node.children.find(child => child.type === 'text');
        textNode.value = capitalize(textNode.value);
      } else {
        calloutClass += ' my-3';
      }
      delete node.data.hProperties['className'];
      node.data.hProperties['class'] = calloutClass;
    });
  };
}

/**
 * A CSS selector cannot start with a digit or a hyphen, but an HTML id can. A heading
 * like "1. Create a Project" slugs to `1-create-a-project`, and Bootstrap scrollspy feeds
 * that straight to querySelector, which throws and kills scrollspy for the whole page.
 * Prefix any such id. Run this before the id reaches the sections or the table of
 * contents, so every reference agrees.
 * @returns {Processor}
 */
function selectableIds() {
  return (tree) => {
    /** @type {Set<string>} */
    const used = new Set();
    visit(tree, node => node.properties?.id !== undefined, (node) => {
      used.add(String(node.properties.id));
    });
    visit(tree, node => /^[0-9-]/.test(String(node.properties?.id ?? '')), (node) => {
      const slug = String(node.properties.id);
      let id = `section-${slug}`;
      for (let n = 2; used.has(id); n++) {
        id = `section-${slug}-${n}`;
      }
      used.add(id);
      node.properties.id = id;
    });
  };
}

/** @type {Processor} */
const parser = remark()
  .use(remarkGfm)
  .use([remarkAlert, alertRestyle])
  .use(remarkBootstrapIcon)
  .use(remarkGemoji)
  .use(remarkTabbedCodeBlock)
  .use(remarkImageClass, {class: 'img-fluid rounded-3'})
  .use(remarkPagination)
  .use(remarkSectionize)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeRaw)
  // enableCustomId is opt-in. Leave it off and the plugin slugs `{#custom-id}` as part of
  // the heading text, which looks like it works until you read the id.
  .use(rehypeSlug, {enableCustomId: true})
  .use(selectableIds)
  .use(rehypeHighlight, {languages: all})
  .use(flattenTopSection)
  .use(moveSlugToSection)
  .use(autoLead)
  .use(headingHr)
  .use(blockQuoteStyle)
  .use(wrapTable)
  .use(imgOptimize)
  .use(extractMeta)
  .use(tocDropdown)
  .use(rehypeStringify, {allowDangerousCharacters: true, allowDangerousHtml: true});

/**
 * @this {import('webpack').LoaderContext}
 * @param source {string}
 * @param [options] {{sync: boolean}}
 */
// noinspection JSUnusedGlobalSymbols
export default function (source, options) {
  if (options?.sync) {
    const result = parser.processSync(source);
    return {content: result.value, meta: result.data}
  } else {
    return parser.process(source).then(result => ({content: result.value, meta: result.data}));
  }
}