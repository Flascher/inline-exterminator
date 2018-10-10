import { validHtmlTags } from './handle-nonstd-tags';

const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];

const getAttrStr = (item) => {
  if (item.attribs && Object.keys(item.attribs).length > 0) {
    // removes any attributes that have a value of undefined
    let attrs = Object.keys(item.attribs).filter(key => {
      return item.attribs[key] !== undefined;
    }).map(key => {
      return item.attribs[key] === ''
        ? key
        : `${key}="${item.attribs[key]}"`
    });

    if (attrs.length > 0) {
      attrs[0] = ` ${attrs[0]}`;
    }
    return attrs.join(' ');
  } else {
    return '';
  }
}

const html = (item, parent, eachFn, nonStdHandler) => {
  if (Array.isArray(item)) {
    return item.map(subItem => html(subItem, parent, eachFn, nonStdHandler)).join('');
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
        let attrStr = getAttrStr(item);

        // check to see if tag is a serverside element that we need to handle
        if (!validHtmlTags.includes(item.name.toLowerCase())) {
          return `<${item.name}${attrStr}>${html(item.children, original, eachFn, nonStdHandler)}${nonStdHandler(item) || ''}`;
        }

        let result = '';

        if (item.children.length > 0) {
          if (!original.render) {
            original = parent;
          }

          const children = html(item.children, original, eachFn, nonStdHandler)
          result = `<${item.name}${attrStr}>${children}</${item.name}>`;
        } else if (voidElements.includes(item.name)) {
          result = `<${item.name}${attrStr} />`;
        } else {
          result = `<${item.name}></${item.name}>`;
        }
        return result;
      case 'cdata':
        return `<![CDATA[${item.data}]]>`
    }
  }

  return item;
}

export default (dom, eachFn, nonStdHandler) => html(dom, null, eachFn, nonStdHandler);