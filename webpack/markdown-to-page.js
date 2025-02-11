import path from "path";
import {remark} from "remark";
import remarkBootstrapIcon from "./remark/bootstrap-icon.js";
import remarkRehype from "remark-rehype";
import {rehypeLinkActive, urlMatches} from "./rehype/link-active.js";
import {visit} from "unist-util-visit";
import {visitParents} from "unist-util-visit-parents";
import {toString} from "hast-util-to-string";
import rehypeStringify from "rehype-stringify";
import {html} from "./htm-rehype.js";
import {idFromTitle} from "./utils.js";

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
 *
 * @param activePath {string}
 * @return {import('unified').Processor}
 */
export function sidebarProcessor(activePath) {
  return remark()
    .use(remarkBootstrapIcon)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeLinkActive, {active: activePath})
    .use(() => {
      /**
       *
       * @param li {import('hast').Element}
       */
      function collapseSubList(li) {
        const ulIndex = li.children.findIndex(({tagName}) => tagName === 'ul');
        if (ulIndex < 0) {
          return;
        }
        const childrenBeforeUl = li.children.slice(0, ulIndex);
        let useCollapse = false;
        if (!childrenBeforeUl.find(({tagName}) => tagName === 'a')) {
          const index = childrenBeforeUl.findIndex(({type}) => type === 'text');
          if (index >= 0) {
            const title = li.children[index].value;
            const id = idFromTitle(title);
            li.children[index] = html`<a data-bs-toggle="collapse" href="#${id}" role="button" aria-expanded="false"
                                         aria-controls="${id}">${title}</a>`;
            li.children[ulIndex].properties = {
              'class': ['collapse'],
              'id': id
            }
            useCollapse = true;
          }
        }
        if (!useCollapse) {
          li.children.splice(ulIndex, 1);
        }
      }

      return (tree, vfile) => {

        visitParents(tree, node => node.tagName === 'li', (li, ancestors) => {
          const depth = ancestors.filter(node => node.tagName === 'ul').length;
          if (depth !== 2) {
            return;
          }

          function linkMatchesActive(a) {
            const href = a.properties?.href;
            if (!href) {
              return false;
            }
            return urlMatches(href, activePath);
          }

          let active = false;
          visit(li, node => node.tagName === 'a' && linkMatchesActive(node), () => active = true);
          if (!active) {
            collapseSubList(li);
          } else {
            li.properties.class = ['active'];
          }
        });
      };
    })
    .use(() => (tree, vfile) => {
      visit(tree, node => node.tagName === 'h1', (h1, index, parent) => {
        vfile.data.title = toString(h1);
        parent.children[index] = {type: 'comment', value: vfile.data.title};
      });
    })
    .use(rehypeStringify, {allowDangerousCharacters: true, allowDangerousHtml: true})
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
  const processor = sidebarProcessor(getPagePath(path.relative(rootContext, resourcePath)));
  /** @type {VFile|undefined} */
  const sidebar = sidebarContent && processor.processSync(sidebarContent);
  Object.assign(data, meta, sidebar && {sidebar: sidebar.data.title || 'Pages'});
  return `{{#partial 'sidebar'}}${sidebar}{{/partial}}{{#> page }}${content}{{/page}}`;
}