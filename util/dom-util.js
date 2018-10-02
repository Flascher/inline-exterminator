import fs from 'fs';
import htmlparser from 'htmlparser';

const getDOMFromFile = (filepath) => {
  const fileContents = fs.readFileSync(filepath, 'utf8');

  const parser = new htmlparser.Parser(new htmlparser.DefaultHandler((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  }));

  parser.parseComplete(fileContents);
  return parser.dom;
}

// recursive check for any dom nodes containing an attr by a name
// returns an array of nodes containing the specified attr
const testForAttrHelper = (node, attr) => {
  if (!node.children) {
    // its a leaf node, return itself if it tests for the attribute being looked for
    if (node.attribs && node.attribs[attr]) {
      return node;
    }
  } else {
    // not a leaf node, but test to see if it tests for the attr
    if (node.attribs && node.attribs[attr]) {
      return [ node, ...node.children.map(child => testForAttr(child, attr)) ];
    } else {
      return 
    }
  }

  return node.children.map(child => testForAttr(child, attr));
}

const testForAttr = (dom, attr) => {
  return dom.map(node => testForAttrHelper(node, attr));
}

const testForTagHelper = (node, tag) => {
  // 
}