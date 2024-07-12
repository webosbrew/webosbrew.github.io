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
import rehypeSlug from 'rehype-slug';
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
  .use(rehypeSlug)
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