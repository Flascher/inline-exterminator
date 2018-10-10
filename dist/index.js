#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _htmlparser = _interopRequireDefault(require("htmlparser2"));

var _soupselectUpdate = require("soupselect-update");

var _uniqueNamesGenerator = _interopRequireDefault(require("unique-names-generator"));

var _sqwish = require("sqwish");

var _commandLine = require("./command-line");

var _htmlparser2html = _interopRequireDefault(require("./htmlparser2html"));

var _handleNonstdTags = require("./handle-nonstd-tags");

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

const minifyCss = str => {
  return (0, _sqwish.minify)(str);
}; // find tags with the undesirables


const getBadStyles = dom => {
  return (0, _soupselectUpdate.select)(dom, '[style]').concat((0, _soupselectUpdate.select)(dom, 'style'));
}; // takes cheerio's attr object for the inline style, and transforms it to its own class with css syntax


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
}; // find if there's a class with the same properties that we can use


const hasMatchingClass = styleAttr => {
  return styleMap.has(styleAttr);
};

const addStyleToMap = (minifiedCss, className) => {
  let key;
  let value;

  if (className !== undefined) {
    key = minifiedCss;
    value = {
      className,
      isUsed: false
    };
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
  // key = styles properties (minified) that belong to a class
  // value = an object containing the class name that contains the styles in its key as well as 
  //         a bool tracking whether this class has already been output to the css file
  styleMap.forEach((v, k) => {
    if (!v.isUsed) {
      const cssString = prettifyCss(`.${v}`, k);

      _fs.default.appendFileSync(_commandLine.options.output, cssString);

      const usedValue = {
        className: v.className,
        isUsed: true
      };
      styleMap.set(k, usedValue);
    }
  });
};

const addInlineStylesToStyleMap = dom => {
  dom.map(node => {
    if (node.attribs && node.attribs.style) {
      // find and handle inline style attributes
      const inlineStyle = node.attribs.style;
      addStyleToMap(minifyCss(inlineStyle));
    }
  });
};

const cleanNode = node => {
  if (node.attribs && node.attribs.style) {
    const minStyle = minifyCss(node.attribs.style);
    const replacementClass = styleMap.get(minStyle).className;

    if (!node.attribs.class) {
      node.attribs.class = replacementClass;
    } else {
      node.attribs.class = `${node.attribs.class} ${replacementClass}`;
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

    styles = minifyCss(styles);
    let match = cssRegex.exec(styles); // if the full match is an empty string we're also done

    while (match !== null && match[0] !== '') {
      matches.push(match);
      match = cssRegex.exec(styles);
    }

    let cssArr = matches.map(match => {
      return prettifyCss(match[1], match[2]);
    });
    const cssOutput = cssArr.join('');

    _fs.default.appendFileSync(_commandLine.options.output, cssOutput);

    return undefined; // remove self from DOM
  } else {
    return node; // otherwise no touchy
  }
};

const nonStandardClosingTagHandler = nonStdMap => {
  return node => {
    return nonStdMap.get(node.name);
  };
};

const outputModifiedSrcFile = (dom, htmlOutput) => {
  const nonStdMap = (0, _handleNonstdTags.getTagMap)();
  const rawHtmlOutput = (0, _htmlparser2html.default)(dom, removeStyleTags, nonStandardClosingTagHandler(nonStdMap));

  _fs.default.writeFileSync(htmlOutput, rawHtmlOutput);
};

const createParseHandler = filename => {
  return new _htmlparser.default.DefaultHandler((err, dom) => {
    if (err) {
      console.error(err);
      process.exit(1); // oh no something bad happened
    } else {
      cleanSrcFile(dom, filename);
    }
  }, {
    decodeEntities: true,
    lowerCaseTags: false
  });
};

let invalidTags = [];

const createPreParseHandler = filename => {
  return {
    callbacks: {
      onopentag: name => {
        if (!_handleNonstdTags.validHtmlTags.includes(name)) {
          invalidTags.push({
            name,
            filename
          });
        }
      },
      onreset: () => {
        linenumber = 1;
        invalidTags = [];
      },
      onerror: err => {
        if (err) {
          console.error(err);
          process.exit(1); // oh no something bad happened.
        }
      }
    },
    options: {
      decodeEntities: true,
      lowerCaseTags: false
    }
  };
};

const getFirstTagLineNumber = (filename, name) => {
  const fileContents = getFileContents(filename);
  const tagRegex = new RegExp(`<${name}\\s`, 'i');
  const firstMatch = tagRegex.exec(fileContents);

  if (firstMatch === null) {
    _fs.default.appendFileSync('nonStdMap.log', `Failed to find ${name} in ${filename}`);

    return '??';
  } else {
    const index = firstMatch.index;
    const fileBeforeMatch = fileContents.substr(0, index);
    const newLineRegex = /\n/g;
    let linenumber = 1;
    let match = newLineRegex.exec(fileBeforeMatch);

    while (match !== null && match.index < index) {
      linenumber++;
      match = newLineRegex.exec(fileBeforeMatch);
    }

    return linenumber;
  }
};

const getInvalidTagInput = async function () {
  for (const tag of invalidTags) {
    const name = tag.name;
    const filename = tag.filename;
    const linenumber = getFirstTagLineNumber(filename, name);
    await (0, _handleNonstdTags.handleNonStandardTags)(name, filename, linenumber);
  }
};

const cleanSrcFile = (dom, filename) => {
  const badStyles = getBadStyles(dom);
  addInlineStylesToStyleMap(badStyles);
  const htmlOutput = _commandLine.options['no-replace'] === undefined ? filename : createModifiedName(filename, _commandLine.options['no-replace']);
  styleMapToCssFile(_commandLine.options.output);
  cleanHtmlTags(dom);
  outputModifiedSrcFile(dom, htmlOutput);
}; // do the stuff, but on a directory


const runDir = async function (runOptions, workingDir) {
  let dir = workingDir === undefined ? runOptions.directory : workingDir;

  let entities = _fs.default.readdirSync(dir);

  let files = [];
  let dirs = [];
  entities.forEach(entity => {
    if (_fs.default.lstatSync(`${dir}/${entity}`).isFile()) {
      files.push(entity);
    } else if (_fs.default.lstatSync(`${dir}/${entity}`).isDirectory()) {
      dirs.push(entity);
    }
  });
  files = filterFiletypes(files);
  const isLeafDir = dirs.length === 0;

  for (const file of files) {
    let filename = `${dir}/${file}`;
    let fileContents = getFileContents(filename);
    const parserOptions = createPreParseHandler(filename);
    let preParser = new _htmlparser.default.Parser(parserOptions.callbacks, parserOptions.options);
    preParser.write(fileContents);
    preParser.end();
    await getInvalidTagInput();
    let parser = new _htmlparser.default.Parser(createParseHandler(filename), parserOptions.options);
    parser.parseComplete(fileContents);
  }

  ;

  if (runOptions.recursive && !isLeafDir) {
    for (const d of dirs) {
      await runDir(runOptions, `${dir}/${d}`);
    }
  } else {
    return;
  }
};

const filterFiletypes = filenames => {
  if (_commandLine.options.filetype) {
    const filetypeRegexes = _commandLine.options.filetype.map(filetype => {
      return new RegExp(` ${filetype}$`, 'i');
    });

    filenames = filenames.filter(filename => {
      return filetypeRegexes.map(regex => {
        return regex.test(filename);
      }).includes(true);
    });
  }

  return filenames;
}; // do the stuff


const run = async function (runOptions) {
  // use options instead of runOptions if being run through
  // cli as opposed to via another script
  if (!runOptions) {
    runOptions = _commandLine.options;
  }

  if (runOptions.help || !runOptions.src && !runOptions.directory) {
    // print help message if not used properly
    console.log(_commandLine.usage);
  } else if (runOptions.directory) {
    runDir(runOptions);
  } else {
    // didn't use directory mode
    let filenames = runOptions.src;
    filenames = filterFiletypes(filenames);

    for (let i = 0; i < filenames.length; i++) {
      let currentFile = filenames[i];
      let fileContents = getFileContents(currentFile);
      const parserOptions = createPreParseHandler(currentFile);
      let preParser = new _htmlparser.default.Parser(parserOptions.callbacks, parserOptions.options);
      preParser.write(fileContents);
      preParser.end();
      await getInvalidTagInput();
      let parser = new _htmlparser.default.Parser(createParseHandler(currentFile), parserOptions.options);
      parser.parseComplete(fileContents);
    }
  }
}; // start up the script when run from command line


run();
var _default = run;
exports.default = _default;
