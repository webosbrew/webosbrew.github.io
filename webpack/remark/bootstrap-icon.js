import {findAndReplace} from 'mdast-util-find-and-replace';

export default function () {
  return function (tree) {
    findAndReplace(tree, [
      /:bi-([\w-]+):/g, (_match, name) => {
        return {type: 'html', value: `<i class="bi bi-${name}"></i>`};
      }
    ]);
  }
}