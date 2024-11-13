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
 * @param fs {import('webpack').LoaderContext<Object>['fs']}
 * @param dir {string}
 * @param root {string}
 * @return {string|null}
 */
function findSidebar(fs, dir, root) {
  while (dir !== root) {
    const sidebar = fs.readdirSync(dir).find(ent => ent.startsWith('_sidebar.'));
    if (sidebar) {
      return path.join(dir, sidebar);
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * @param content {string}
 * @param meta {Object}
 * @param loaderContext {import('webpack').LoaderContext<Object> & { data: { [key: string]: any } | string }}
 */
export default function (content, meta, loaderContext) {
  const {resourcePath, data, context, rootContext, fs} = loaderContext;
  const sidebarPath = findSidebar(fs, path.dirname(resourcePath), rootContext);
  const sidebarContent = sidebarPath && fs.readFileSync(sidebarPath, 'utf-8').trim();
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
  const sidebar = sidebarContent && processor.processSync(sidebarContent);
  Object.assign(data, meta, sidebar && {sidebar: sidebar.data.title || 'Pages'});
  return `{{#partial 'sidebar'}}${sidebar}{{/partial}}{{#> page }}${content}{{/page}}`;
}