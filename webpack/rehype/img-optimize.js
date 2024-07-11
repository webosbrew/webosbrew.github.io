import {visit} from "unist-util-visit";
import {html} from "../htm-rehype.js";

export default function () {
  return (tree) => {
    visit(tree, /**@param node {HtmlElement}*/(node) => node.type === 'element' && node.tagName === 'img',
      /**
       * @param img {HtmlElement}
       * @param index {number}
       * @param parent {HtmlElement}
       */(img, index, parent) => {
        parent.children[index] = html`
          <picture>
            <source srcset="${img.properties.src}?as=avif" type="image/avif"/>
            <source srcset="${img.properties.src}?as=webp" type="image/webp"/>
            ${img}
          </picture>
        `;
      });
  }
}