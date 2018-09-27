#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usage = exports.options = void 0;

var _commandLineArgs = _interopRequireDefault(require("command-line-args"));

var _commandLineUsage = _interopRequireDefault(require("command-line-usage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const packageName = 'inline-exterminator'; // ========================
//   command line options
// ========================
//
// <src> : files to run script on
// <directory>  : directory to run script on
// <recursive>  : whether to operate on subdirectories of directory
// <filetype>   : filetypes to work on (*.jsp, *.html, *.asp, etc)
// <no-replace> : doesn't modify specified files if not null, generates new modified copies instead using the string as the suffix to the filename
// <output>     : name of the css file to put the stripped inline styles in

const optionDefinitions = [{
  name: 'src',
  type: String,
  multiple: true,
  defaultOption: true
}, {
  name: 'directory',
  alias: 'd',
  type: String
}, {
  name: 'recursive',
  alias: 'r',
  type: Boolean
}, {
  name: 'filetype',
  alias: 't',
  type: String
}, {
  name: 'no-replace',
  alias: 'n',
  type: String
}, {
  name: 'output',
  alias: 'o',
  type: String
}, {
  name: 'help',
  alias: 'h',
  type: Boolean
}];
const options = (0, _commandLineArgs.default)(optionDefinitions);
exports.options = options;
const sections = [{
  header: packageName,
  content: `This script will run through HTML and remove inline style attributes and 
            tags, and move them to a specified css file. The removed styles will be replaced 
            with random class names in the HTML. Duplicate inline styles will use the same 
            classes. ${packageName}\'s goal is to create more easily maintanable code.`
}, {
  header: 'Options',
  optionList: [{
    name: 'src',
    typeLabel: '{underline file}',
    multiple: true,
    defaultOption: true,
    description: 'The file(s) to run this script on. multiple files can be specified by repeating the --src flag.\n'
  }, {
    name: 'directory',
    typeLabel: '{underline dir}',
    alias: 'd',
    description: '(Not yet implemented) The directory to run this script on. Doesn\'t work without the --filetype ' + 'option to avoid operating on every file.\n'
  }, {
    name: 'recursive',
    alias: 'r',
    description: `(Not yet implemented) If this option is used ${packageName} will work recursively through all directories starting with the directory the script is run in as the root directory.\n`
  }, {
    name: 'filetype',
    alias: 't',
    typeLabel: '{underline filetype}',
    description: '(Not yet implemented) The file type to limit operations to. This will prevent IA from ' + 'modifying every file while it attempts to remove inline styles.\n'
  }, {
    name: 'no-replace',
    alias: 'n',
    typeLabel: '{underline suffix}',
    description: 'The suffix to add onto the end of the html files it would otherwise modify directly ' + 'i.e.: test.html would become test.{underline suffix}.html\n'
  }, {
    name: 'output',
    alias: 'o',
    typeLabel: '{underline filename.css}',
    description: 'The name of the file to save the extracted inline styles in. This will be formatted as vanilla CSS.\n'
  }, {
    name: 'help',
    alias: 'h',
    description: 'Print this help message.\n'
  }]
}, {
  header: 'Examples',
  content: {
    options: {
      maxWidth: 150
    },
    data: [{
      desc: `1. Basic usage. --src can be ommitted if ${packageName} used on only one file\n`,
      example: `${packageName} example.html --output example.css`
    }, {
      desc: `2. No-replace mode. The file being operated on (example.html) will not be modified. example.clean.html will be created.\n`,
      example: `${packageName} example.html --output example.css --no-replace clean`
    }]
  }
}];
const usage = (0, _commandLineUsage.default)(sections);
exports.usage = usage;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
const serverSideElements = ['%', '%#', '%:', '%=', '%@', '%--', '%--taglib', '?=', '?'];

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
        if (serverSideElements.includes(item.name)) {
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
"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _htmlparser = _interopRequireDefault(require("htmlparser"));

var _soupselectUpdate = require("soupselect-update");

var _uniqueNamesGenerator = _interopRequireDefault(require("unique-names-generator"));

var _commandLine = require("./command-line");

var _htmlparser2html = _interopRequireDefault(require("./htmlparser2html"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// global hashmap to keep track of classes that have already been created
// this should reduce or eliminate any classes that would otherwise have duplicate properties
const styleMap = new Map();

const printStyleMap = () => {
  console.log('styleMap:');
  styleMap.forEach((v, k) => {
    console.log(` ${k} => ${v}`);
  });
}; // file loading


const getFileContents = filename => {
  return _fs.default.readFileSync(filename, 'utf8');
}; // create new filename for current file if no-replace flag is used


const createModifiedName = (filename, modifier) => {
  const splitFilename = filename.split('.');
  const splitLength = splitFilename.length;
  splitFilename.splice(splitLength - 1, 0, `${modifier}`);
  return splitFilename.join('.');
};

const removeWhitespace = str => {
  return str.replace(/\s*/gm, '');
}; // find tags with the undesirables


const getBadStyles = dom => {
  return (0, _soupselectUpdate.select)(dom, '[style]').concat((0, _soupselectUpdate.select)(dom, 'style'));
}; // takes cheerio's attr object for the inline style, and transforms it to its own class with css syntax


const generateCssRuleFromInlineStyle = (rule, styleAttr) => {
  // filter out any empty strings. if last character in styleAttr is ; then it will have an empty string at the end of the array
  const properties = styleAttr.split(';').filter(property => property.length > 0);
  const numProperties = properties.length;
  const styleProperties = properties.map((property, i) => {
    // don't give newline to last property so there isn't an empty line at the end of the css class
    const newline = i === numProperties - 1 ? '' : '\n';
    return `  ${property};${newline}`;
  });
  const propertiesString = styleProperties.join('');
  const classString = `.${rule} {\n${propertiesString}\n}\n\n`;
  return classString;
}; // find if there's a class with the same properties that we can use


const hasMatchingClass = styleAttr => {
  return styleMap.has(styleAttr);
};

const addStyleToMap = (minifiedCss, className) => {
  let key;
  let value;

  if (className !== undefined) {
    key = minifiedCss;
    value = className;
    styleMap.set(key, value);
  } // if there's no matching class, we should create one, put it in the hash map, and write to the css file
  else if (!hasMatchingClass(minifiedCss)) {
      const randomClass = _uniqueNamesGenerator.default.generate('-');

      key = minifiedCss; // remove whitespace from properties for format-agnostic duplicate checking

      value = randomClass;
      styleMap.set(key, value);
    }
};

const styleMapToCssFile = filename => {
  // key = styles (no whitespace) that belong to a class
  // value = the class name that contains the styles in its key
  styleMap.forEach((v, k) => {
    const cssString = generateCssRuleFromInlineStyle(v, k);

    _fs.default.appendFileSync(_commandLine.options.output, cssString);
  });
};

const addInlineStylesToStyleMap = dom => {
  dom.map(node => {
    if (node.attribs) {
      // find and handle inline style attributes
      const inlineStyle = node.attribs.style;
      addStyleToMap(removeWhitespace(inlineStyle));
    }
  });
};

const cleanNode = node => {
  if (node.attribs && node.attribs.style) {
    const minStyle = removeWhitespace(node.attribs.style);
    const replacementClass = styleMap.get(minStyle);

    if (!node.attribs.class) {
      node.attribs.class = replacementClass;
    } else {
      node.attribs.class = ` ${replacementClass}`;
    } // remove that nasty inline style


    node.attribs.style = undefined;
  }

  return node;
};

const replaceStyleAttrs = node => {
  if (!node.children) {
    // we've hit a leaf, return the cleaned leaf
    return cleanNode(node);
  }

  cleanNode(node);
  return node.children.map(replaceStyleAttrs);
};

const cleanHtmlTags = dom => {
  // filter out style tags first
  dom = dom.filter(node => {
    return node.name !== 'style';
  }); // then map to replace inline style attrs with classes

  dom.map(replaceStyleAttrs);
};

const removeStyleTags = (node, parent) => {
  if (node.name === 'style') {
    // take style tag innerText and just move it straight to the css file
    let styles = node.children[0].data; // we'll have to parse the css to get the properties out of it and check to see if we can
    // match any inline styles to currently existing classes
    // each match will have 3 capture groups.
    // 0th is the full match
    // 1st being the selector
    // 2nd is the properties contained within that rule

    const cssRegex = /(?:([^\{\}]*))(?:{(.*?\s*)})*/gi;
    const matches = []; // find all matches of regex in the style tag's innerText

    styles = removeWhitespace(styles);
    let match = cssRegex.exec(styles); // if the full match is an empty string we're also done

    while (match !== null && match[0] !== '') {
      matches.push(match);
      match = cssRegex.exec(styles);
    }

    let cssArr = matches.map(match => {
      return `${match[1]} {\n  ${match[2]}\n}\n\n`;
    });
    const cssOutput = cssArr.join('');

    _fs.default.appendFileSync(_commandLine.options.output, cssOutput);

    return undefined; // remove self from DOM
  } else {
    return node; // otherwise no touchy
  }
};

const outputModifiedSrcFile = (dom, htmlOutput) => {
  // html.configure({ disableAttribEscape: true });
  const rawHtmlOutput = (0, _htmlparser2html.default)(dom, removeStyleTags);

  _fs.default.writeFileSync(htmlOutput, rawHtmlOutput);
};

const parseHandler = new _htmlparser.default.DefaultHandler((err, dom) => {
  if (err) {
    console.error(err);
    process.exit(1); // oh no something bad happened.
  } else {
    cleanSrcFile(dom);
  }
});
let currentFile = '';

const cleanSrcFile = dom => {
  const badStyles = getBadStyles(dom);
  addInlineStylesToStyleMap(badStyles);
  const htmlOutput = _commandLine.options['no-replace'] === undefined ? currentFile : createModifiedName(currentFile, _commandLine.options['no-replace']);
  styleMapToCssFile(_commandLine.options.output);
  cleanHtmlTags(dom);
  outputModifiedSrcFile(dom, htmlOutput);
}; // do the stuff


const run = () => {
  if (_commandLine.options.help) {
    console.log(_commandLine.usage);
  } else {
    for (let i = 0; i < _commandLine.options.src.length; i++) {
      currentFile = _commandLine.options.src[i];
      let fileContents = getFileContents(currentFile);
      let parser = new _htmlparser.default.Parser(parseHandler);
      parser.parseComplete(fileContents);
    }
  }
}; // start up the script


run();
