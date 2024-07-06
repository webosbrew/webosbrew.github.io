import htm from "htm";

function createElement(type, props, ...children) {
  return {
    type: 'element',
    tagName: type,
    properties: props ?? {},
    children: children.flatMap(child => Array.isArray(child) ? child : [child])
      .filter(v => v)
      .map(child => typeof child === 'string' ? {type: 'text', value: child} : child)
  };
}

export const html = htm.bind(createElement);