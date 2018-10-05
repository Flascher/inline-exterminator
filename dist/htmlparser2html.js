"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
const validHtmlTags = ['!--', '!DOCTYPE', 'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'head', 'header', 'h1', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'p', 'param', 'pre', 'progress', 'q', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'u', 'ul', 'var', 'video', 'wbr'];
const serverSideElements = ['%', '%#', '%:', '%=', '%@', '%@page', 'jsp:param', 'jsp:include', 'bean:write', 'html:text', 'html:hidden', '%--', '%--taglib', '?=', '?'];

const html = (item, parent, eachFn) => {
  if (Array.isArray(item)) {
    return item.map(subItem => html(subItem, parent, eachFn)).join('');
  }

  let original = item;

  if (eachFn) {
    item = eachFn(item, parent);
  }

  if (item != undefined && item.type !== undefined) {
    switch (item.type) {
      case 'text':
        return item.data;

      case 'directive':
        return `<${item.data}>`;

      case 'comment':
        return `<!-- ${item.data} -->`;

      case 'style':
      case 'script':
      case 'tag':
        // check to see if tag is a serverside element that we don't want to bother with
        if (!validHtmlTags.includes(item.name)) {
          if (item.children) {
            return `<${item.raw}>${html(item.children, original, eachFn)}`;
          } else {
            return `<${item.raw}>`;
          }
        }

        let result = '';
        let attrStr = '';

        if (item.attribs && Object.keys(item.attribs).length > 0) {
          // removes any attributes that have a value of undefined
          let attrs = Object.keys(item.attribs).filter(key => {
            return item.attribs[key] !== undefined;
          }).map(key => `${key}="${item.attribs[key]}"`);

          if (attrs.length > 0) {
            attrs[0] = ` ${attrs[0]}`;
          }

          attrStr = attrs.join(' ');
        }

        if (item.children) {
          if (!original.render) {
            original = parent;
          }

          const children = html(item.children, original, eachFn);
          result = `<${item.name}${attrStr}>${children}</${item.name}>`;
        } else if (voidElements.includes(item.name)) {
          result = `<${item.name}${attrStr} />`;
        } else {
          result = `<${item.name}></${item.name}>`;
        }

        return result;

      case 'cdata':
        return `<![CDATA[${item.data}]]>`;
    }
  }

  return item;
};

var _default = (dom, eachFn) => html(dom, null, eachFn);

exports.default = _default;