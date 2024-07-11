/**
 * @typedef {Object} Options
 * @property {string} [class] - The class to add to the image
 */
import {visit} from "unist-util-visit";

/**
 * Add classes to images in markdown
 * @param options {Options}
 * @returns {Processor}
 */
export default function (options) {
  return (tree) => {
    visit(tree, /**@param node {MarkdownNode}*/(node) => node.type === 'image',
      /** @param node {MarkdownImage} */
      (node) => {
        if (!node.data) {
          node.data = {};
        }
        if (!node.data.hProperties) {
          node.data.hProperties = {};
        }
        node.data.hProperties.class = options.class;
      });
  }
}