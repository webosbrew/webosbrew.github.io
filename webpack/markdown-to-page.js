import path from "path";

import {remark} from "remark";

import remarkRehype from "remark-rehype";
import remarkBootstrapIcon from "./remark/bootstrap-icon.js";

import {rehypeLinkActive} from "./rehype/link-active.js";
import rehypeStringify from "rehype-stringify";

import {visit} from "unist-util-visit";
import {toString} from "hast-util-to-string";

/**
 * @param relative {string}
 * @return {string}
 */
function getPagePath(relative) {
  let segs = relative.split(path.sep);
  if (segs[0] === 'src' && segs[1] === 'views') {
    segs = segs.slice(2);
  }
  if (segs[0] === 'index') {
    return '/';
  }
  const parsed = path.parse(segs.join(path.posix.sep));
  return `/${path.posix.format(parsed.name === 'index' ? {root: parsed.dir} : {dir: parsed.dir, name: parsed.name})}`;
}

/**
 * @param content {string}
 * @param meta {Object}
 * @param loaderContext {import('webpack').LoaderContext<Object> & { data: { [key: string]: any } | string }}
 */
export default function (content, meta, loaderContext) {
  const {resourcePath, data, context, rootContext, fs} = loaderContext;
  const sidebarEnt = fs.readdirSync(path.dirname(resourcePath))
    .find(ent => ent.startsWith('_sidebar.'));
  const processor = remark()
    .use(remarkBootstrapIcon)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeLinkActive, {active: getPagePath(path.relative(rootContext, resourcePath))})
    .use(() => (tree, vfile) => {
      visit(tree, e => e.tagName === 'h1', (h1, index, parent) => {
        vfile.data.title = toString(h1);
        parent.children[index] = {type: 'comment', value: vfile.data.title};
      });
    })
    .use(rehypeStringify, {allowDangerousCharacters: true, allowDangerousHtml: true});
  /** @type {VFile|undefined} */
  const sidebar = sidebarEnt ? processor
    .processSync(fs.readFileSync(path.join(context, sidebarEnt))) : undefined;
  Object.assign(data, meta, sidebar && {sidebar: sidebar.data.title || 'Pages'});
  return `{{#partial 'sidebar'}}${sidebar}{{/partial}}{{#> page }}${content}{{/page}}`;
}