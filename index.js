const fs = require('fs');
const { inspect } = require('util');
const htmlparser = require('htmlparser');
const html = require('htmlparser-to-html');
const $ = require('soupselect').select;
const nameGenerator = require('unique-names-generator');
const pd = require('pretty-data').pd;

const options = require('./command-line').options;
const usage = require('./command-line').usage;

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

const removeWhitespace = (str) => {
  return str.replace(/\s*/gm, '');
}

// find tags with the undesirables
const getBadStyles = (dom) => {
  return $(dom, '[style]').concat($(dom, 'style'));
}

// takes cheerio's attr object for the inline style, and transforms it to its own class with css syntax
const generateCssClassFromInlineStyle = (className, styleAttr) => {
  // filter out any empty strings. if last character in styleAttr is ; then it will have an empty string at the end of the array
  const properties = styleAttr.split(';').filter(property => property.length > 0);
  const numProperties = properties.length;
  const styleProperties = properties.map((property, i) => {
    // don't give newline to last property so there isn't an empty line at the end of the css class
    const newline = i === numProperties - 1 ? '' : '\n';

    return `  ${property};${newline}`;
  });
  const propertiesString = styleProperties.join('');

  const classString = `.${className} {\n${propertiesString}\n}\n\n`;

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
    const cssString = generateCssClassFromInlineStyle(v, k);
    fs.appendFileSync(options.output, cssString);
  });

}

const addInlineStylesToStyleMap = (dom) => {
  dom.map(node => {
    if (node.name === 'style') {
      // this if case handles style tags

      // take style tag innerText and just move it straight to the css file
      let styles = node.children[0].data;

      // we'll have to parse the css to get the properties out of it and check to see if we can
      // match any inline styles to currently existing classes

      // each match will have 3 capture groups.
      // 0th is the full match
      // 1st being the className (including the .)
      // 2nd is the properties contained within that class
      // css passed into cssRegex MUST be minified (remove whitespace / newlines)
      styles = removeWhitespace(styles);
      const cssRegex = /(?:\.(\w*))(?:{(.*?\s*)})*/gmi;
      const matches = [];
      
      // find all matches of regex in the style tag's innerText
      let match = cssRegex.exec(styles);
      while (match !== null) {
        matches.push(match);
        match = cssRegex.exec(styles);
      }
    
      const classNames = matches.map(match => match[1]);
      const properties = matches.map(match => match[2]);

      for (let i = 0; i < properties.length; i++) {
        addStyleToMap(properties[i], classNames[i]);
      }
    } else {
      // else case handles style attributes

      const inlineStyle = node.attribs.style;
      addStyleToMap(removeWhitespace(inlineStyle));
    }
  });
}

const cleanNode = (node) => {
  if (node.attribs && node.attribs.style) {
    const minStyle = removeWhitespace(node.attribs.style);
    const replacementClass = styleMap.get(minStyle);

    if (!node.attribs.class) {
      node.attribs.class = replacementClass;
    } else {
      node.attribs.class = ` ${replacementClass}`;
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

const outputModifiedSrcFile = (dom, htmlOutput) => {
  html.configure({ disableAttribEscape: true });
  const rawHtmlOutput = html(dom)
  fs.writeFileSync(htmlOutput, pd.xml(rawHtmlOutput));
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
  
  styleMapToCssFile(options.output);
  
  const htmlOutput = options['no-replace'] === undefined
    ? currentFile
    : createModifiedName(currentFile, options['no-replace']);

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