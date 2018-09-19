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

const html = (item, parent, eachFn) => {
  if (Array.isArray(item)) {
    return item.map(subItem => html(subItem, parent, eachFn)).join('');
  }

  let original = item;
  if (eachFn) {
    item = eachFn(item, parent);
  }

  if (typeof item !== undefined && typeof item.type !== undefined) {
    if (item.type === 'tag') {

    }

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
        let result = '';
        let attrStr = '';
        if (item.attribs && Object.keys(item.attribs).length > 0) {
          let attrs = Object.keys(item.attribs).map(key => `${key}="${item.attribs[key]}"`);
          if (attrs.length > 0) {
            attrs.unshift(' ');
          }
          attrStr = attrs.join(' ');
        }

        if (item.children) {
          if (!original.render) {
            original = parent;
          }

          const children = html(item.children, original, eachFn)
          const isVoidElement = voidElements.includes(item.name);
          const closingTag = isVoidElement ? ' />' : `</${item.name}>`
          result = `<${item.name}${attrStr}>${html(item.children, original, eachFn)}${closingTag}`;
        } else if (voidElements.includes(item.name)) {
          result = `<${item.name} />`;
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

exports.html = html;