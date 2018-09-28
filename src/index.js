import fs from 'fs';
import htmlparser from 'htmlparser';
import { select as $ } from 'soupselect-update';
import nameGenerator from 'unique-names-generator';
import { minify } from 'sqwish';

import { options, usage } from './command-line';
import html from './htmlparser2html';

// global hashmap to keep track of classes that have already been created
// this should reduce or eliminate any classes that would otherwise have duplicate properties
const styleMap = new Map();

const printStyleMap = () => {
  console.log('styleMap:')
  styleMap.forEach((v, k) => {
    console.log(` ${k} => ${v}`);
  });
}

// file loading
const getFileContents = (filename) => {
  return fs.readFileSync(filename, 'utf8');
}

// create new filename for current file if no-replace flag is used
const createModifiedName = (filename, modifier) => {
  const splitFilename = filename.split('.');
  const splitLength = splitFilename.length;

  splitFilename.splice(splitLength - 1, 0, `${modifier}`);
  return splitFilename.join('.');
}

const minifyCss = (str) => {
  return minify(str);
}

// find tags with the undesirables
const getBadStyles = (dom) => {
  return $(dom, '[style]').concat($(dom, 'style'));
}

// takes cheerio's attr object for the inline style, and transforms it to its own class with css syntax
const prettifyCss = (selector, declaration) => {
  // filter out any empty strings. if last character in styleAttr is ; then it will have an empty string at the end of the array
  const properties = declaration.split(';').filter(property => property.length > 0);
  const numProperties = properties.length;
  const styleProperties = properties.map((property, i) => {
    // don't give newline to last property so there isn't an empty line at the end of the css class
    const newline = i === numProperties - 1 ? '' : '\n';

    return `  ${property};${newline}`;
  });
  const declarationString = styleProperties.join('');

  const classString = `${selector} {\n${declarationString}\n}\n\n`;

  return classString;
};

// find if there's a class with the same properties that we can use
const hasMatchingClass = (styleAttr) => {
  return styleMap.has(styleAttr);
}

const addStyleToMap = (minifiedCss, className) => {
  let key;
  let value;
  
  if (className !== undefined) {
    key = minifiedCss;
    value = className;

    styleMap.set(key, value);
  }
  // if there's no matching class, we should create one, put it in the hash map, and write to the css file
  else if (!hasMatchingClass(minifiedCss)) {
    const randomClass = nameGenerator.generate('-');
    key = minifiedCss;
    // remove whitespace from properties for format-agnostic duplicate checking
    value = randomClass;

    styleMap.set(key, value);
  }
}

const styleMapToCssFile = (filename) => {
  // key = styles (no whitespace) that belong to a class
  // value = the class name that contains the styles in its key
  styleMap.forEach((v, k) => {
    const cssString = prettifyCss(`.${v}`, k);
    fs.appendFileSync(options.output, cssString);
  });

}

const addInlineStylesToStyleMap = (dom) => {
  dom.map(node => {
    if (node.attribs) {
      // find and handle inline style attributes
      const inlineStyle = node.attribs.style;
      addStyleToMap(minifyCss(inlineStyle));
    }
  });
}

const cleanNode = (node) => {
  if (node.attribs && node.attribs.style) {
    const minStyle = minifyCss(node.attribs.style);
    const replacementClass = styleMap.get(minStyle);

    if (!node.attribs.class) {
      node.attribs.class = replacementClass;
    } else {
      node.attribs.class = `${node.attribs.class} ${replacementClass}`;
    }

    // remove that nasty inline style
    node.attribs.style = undefined;
  }

  return node;
}

const replaceStyleAttrs = (node) => {
  if (!node.children) {
    // we've hit a leaf, return the cleaned leaf
    return cleanNode(node);
  }
  cleanNode(node);

  return node.children.map(replaceStyleAttrs);
}

const cleanHtmlTags = (dom) => {
  // filter out style tags first
  dom = dom.filter(node => {
    return node.name !== 'style'
  });

  // then map to replace inline style attrs with classes
  dom.map(replaceStyleAttrs);
}

const removeStyleTags = (node, parent) => {
  if(node.name === 'style') {
    // take style tag innerText and just move it straight to the css file
    let styles = node.children[0].data;

    // we'll have to parse the css to get the properties out of it and check to see if we can
    // match any inline styles to currently existing classes

    // each match will have 3 capture groups.
    // 0th is the full match
    // 1st being the selector
    // 2nd is the properties contained within that rule
    const cssRegex = /(?:([^\{\}]*))(?:{(.*?\s*)})*/gi;
    const matches = [];
    
    // find all matches of regex in the style tag's innerText
    styles = minifyCss(styles);
    let match = cssRegex.exec(styles);
    // if the full match is an empty string we're also done
    while (match !== null && match[0] !== '') {
      matches.push(match);
      match = cssRegex.exec(styles);
    }

    let cssArr = matches.map(match => {
      return prettifyCss(match[1], match[2]);
    });

    const cssOutput = cssArr.join('');

    fs.appendFileSync(options.output, cssOutput);

    return undefined; // remove self from DOM
  } else {
    return node; // otherwise no touchy
  }
}

const outputModifiedSrcFile = (dom, htmlOutput) => {
  // html.configure({ disableAttribEscape: true });
  const rawHtmlOutput = html(dom, removeStyleTags)
  fs.writeFileSync(htmlOutput, rawHtmlOutput);
}

const parseHandler = new htmlparser.DefaultHandler((err, dom) => {
  if (err) {
    console.error(err);
    process.exit(1); // oh no something bad happened.
  } else {
    cleanSrcFile(dom);
  }
});

let currentFile = '';

const cleanSrcFile = (dom) => {
  const badStyles = getBadStyles(dom);
  addInlineStylesToStyleMap(badStyles);
  
  
  const htmlOutput = options['no-replace'] === undefined
    ? currentFile
    : createModifiedName(currentFile, options['no-replace']);
  
  styleMapToCssFile(options.output);

  cleanHtmlTags(dom);
  outputModifiedSrcFile(dom, htmlOutput);
}

// do the stuff
const run = () => {
  if (options.help) {
    console.log(usage);
  } else {
    for (let i = 0; i < options.src.length; i++) {
      currentFile = options.src[i];
      let fileContents = getFileContents(currentFile);
      
      let parser = new htmlparser.Parser(parseHandler);
      parser.parseComplete(fileContents);
    }
  }
}

// start up the script
run();