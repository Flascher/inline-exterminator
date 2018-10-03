import fs from 'fs';
import htmlparser from 'htmlparser';

const getDOMFromFile = (filepath) => {
  const fileContents = fs.readFileSync(filepath, 'utf8');

  const parseHandler = new htmlparser.DefaultHandler((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
  const parser = new htmlparser.Parser(parseHandler);

  parser.parseComplete(fileContents);
  return parseHandler.dom;
}

// turn multidimensional arrays into flat arrays
const flatten = (arr) => {
  return arr.reduce((acc, el) => {
    if (el.length > 0) {
      acc = acc.concat(flatten(el));
    } else {
      acc.push(el);
    }
  }, []);
}

const hasAttr = (dom, attr) => {
  const attrReducer = (acc, node) => {
    if (!node.children) {
      if (node.attribs && node.attribs[attr]) {
        acc += 1;
        return acc;
      }
    } else {
      if (node.attribs && node.attribs[attr]) {
        acc += 1;
      }
      return acc + node.children.reduce(attrReducer, 0);
    }
  }

  // if the result is > 0 then <dom> contains <attr>
  return dom.reduce(attrReducer, 0) > 0;
}

const hasTag = (dom, tag) => {
  const tagReducer = (acc, node) => {
    if (!node.children) {
      if (node.name === tag) {
        acc += 1;
        return acc;
      }
    } else {
      if (node.name === tag) {
        acc += 1;
      }
      return acc + node.children.reduce(tagReducer, 0);
    }
  }

  // if the result is > 0, then <dom> contains <tag>
  return dom.reduce(tagReducer, 0) > 0;
}

const hasInlineStyles = (dom) => {
  return hasAttr(dom, 'style') || hasTag(dom, 'style');
}

export {
  getDOMFromFile,
  hasAttr,
  hasTag,
  hasInlineStyles
}