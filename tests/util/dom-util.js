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

// recursive check for any dom nodes containing an attr by a name
// returns an array of nodes containing the specified attr
const testForAttrHelper = (acc, node, attr) => {
  if (!node.children) {
    // its a leaf node, return itself if it tests for the attribute being looked for
    if (node.attribs && node.attribs[attr]) {
      return node;
    }
  } else {
    // not a leaf node, but test to see if it tests for the attr,
    // if so, concat itself onto the list being returned
    if (node.attribs && node.attribs[attr]) {
      return [ ...acc, node, ...node.children.map(child => testForAttrHelper(acc, child, attr)) ];
    } else {
      return node.children.map(child => testForAttrHelper(acc, child, attr));
    }
  }
}

const testForAttr = (dom, attr) => {
  return dom.reduce((acc, node) => testForAttrHelper(acc, node, attr), []);
}

const testForTagHelper = (acc, node, tag) => {
  if (!node.children) {
    if (node.name === tag) {
      return node;
    }
  } else {
    if (node.name === tag) {
      return [ node, ...node.children.map(child => testForTagHelper(acc, child, tag)) ];
    } else {
      return node.children.map(child => testForTagHelper(acc, child, tag));
    }
  }
}

const testForTag = (dom, tag) => {
  return dom.reduce((acc, node) => testForTagHelper(acc, node, tag), []);
}

export {
  getDOMFromFile,
  testForAttr,
  testForTag
}