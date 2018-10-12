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

var _deprecatedHtml = require("./deprecated-html");

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
      className: className,
      isUsed: false
    };
    styleMap.set(key, value);
  } // if there's no matching class, we should create one, put it in the hash map, and write to the css file
  else if (!hasMatchingClass(minifiedCss)) {
      const randomClass = _uniqueNamesGenerator.default.generate('-');

      key = minifiedCss; // remove whitespace from properties for format-agnostic duplicate checking

      value = {
        className: randomClass,
        isUsed: false
      };
      styleMap.set(key, value);
    }
};

const styleMapToCssFile = filename => {
  // key = styles properties (minified) that belong to a class
  // value = an object containing the class name that contains the styles in its key as well as 
  //         a bool tracking whether this class has already been output to the css file
  styleMap.forEach((v, k) => {
    if (!v.isUsed) {
      const cssString = prettifyCss(`.${v.className}`, k);

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

let deprecationClasses = [];

const addClassToNode = (node, className) => {
  if (node.attribs === undefined) {
    node.attribs = {
      class: className
    };
  } else {
    if (node.attribs.class === undefined) {
      node.attribs.class = className;
    } else {
      if (node.attribs.class.indexOf(className) === -1) {
        node.attribs.class = `${node.attribs.class} ${className}`;
      }
    }
  }

  return node;
};

const updateDeprecatedTag = node => {
  switch (node.name) {
    case 'center':
      node.name = 'div';
      addClassToNode(node, 'centered');
      deprecationClasses.push({
        className: 'centered',
        declaration: 'text-align:center;'
      });
      break;

    case 'basefont':
    case 'font':
      let fontColor, fontFace, fontSize, declaration;

      const fontClass = _uniqueNamesGenerator.default.generate('-');

      if (node.attribs) {
        fontColor = node.attribs.color || '';
        fontFace = node.attribs.face || '';
        fontSize = (0, _deprecatedHtml.fontTagSizeToCss)(node.attribs.size);
        declaration = `color:${fontColor};font-family:${fontFace};font-size:${fontSize}`;
        deprecationClasses.push({
          className: fontClass,
          declaration: declaration
        });
      }

      if (node.children && node.children.length > 0) {
        const updatedChildren = node.children.map(child => addClassToNode(child, fontClass)); // find the font tag's index in the children array

        const fontIndex = node.parent.children.findIndex(child => Object.is(node, child)); // replace the font tag with all of its children

        node.parent.children.splice(fontIndex, 1, ...updatedChildren);
      }

      break;
  }
};

const updateDeprecatedAttr = (node, attr) => {
  let attrClass;
  let declaration = '';
  let selectorExtra = '';
  let hasSelectorExtra = false;

  switch (attr) {
    case 'align':
      attrClass = `align-${node.attribs[attr]}`;
      declaration = `text-align:${node.attribs[attr]};`;
      break;

    case 'bgcolor':
      attrClass = _uniqueNamesGenerator.default.generate('-');
      declaration = `background-color:${node.attribs[attr]};`;
      break;

    case 'border':
      attrClass = `border-width-${node.attribs[attr]}`;
      declaration = `border-width:${node.attribs[attr]};`;
      break;

    case 'cellpadding':
      attrClass = `padding-${node.attribs[attr]}`;
      declaration = `border-collapse:collapse;padding:${node.attribs[attr]};`;
      selectorExtra = ['th', 'td'];
      hasSelectorExtra = true;
      break;

    case 'cellspacing':
      attrClass = `border-spacing-${node.attribs[attr]}`;
      declaration = `border-collapse:collapse;border-spacing:${node.attribs[attr]};`;
      selectorExtra = ['th', 'td'];
      hasSelectorExtra = true;
      break;

    case 'width':
      const match = node.attribs[attr].match(/^(\d*|\d*\.\d*)(\w*)$/);
      let value = match[1] || '';
      let unit = match[2] || '';
      unit = unit === '' ? 'px' : unit;
      attrClass = `width-${value}${unit}`;
      declaration = `width:${value}${unit};`;
      break;

    case 'valign':
      attrClass = `vert-align-${node.attribs[attr]}`;
      declaration = `vertical-align:${node.attribs[attr]};`;
      break;

    default:
      return;
  }

  if (!styleMap.has(declaration) && !hasSelectorExtra) {
    addStyleToMap(declaration, attrClass);
  } else if (hasSelectorExtra) {
    const cssSelector = selectorExtra.map(extra => {
      return `.${attrClass} ${extra}`;
    }).join(',\n');

    _fs.default.appendFileSync(_commandLine.options.output, prettifyCss(cssSelector, declaration));
  } else {
    attrClass = styleMap.get(declaration).className;
  }

  node.attribs[attr] = undefined; // delete deprecated attr

  addClassToNode(node, attrClass);
};

const handleDeprecations = node => {
  if ((0, _deprecatedHtml.isTagDeprecated)(node)) {
    updateDeprecatedTag(node);
  }

  const deprecatedAttrs = (0, _deprecatedHtml.getDeprecatedAttrsForNode)(node);

  if (deprecatedAttrs.length > 0) {
    deprecatedAttrs.forEach(attr => updateDeprecatedAttr(node, attr));
  }

  deprecationClasses.forEach(classObj => addStyleToMap((0, _sqwish.minify)(classObj.declaration), classObj.className));
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

  handleDeprecations(node);
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
    _fs.default.appendFileSync('nonStdMap.log', `Failed to find ${name} in ${filename}\n`);

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
  cleanHtmlTags(dom);
  styleMapToCssFile(_commandLine.options.output);
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
  if (runOptions) {
    _commandLine.options = (runOptions, function () {
      throw new Error('"' + "options" + '" is read-only.');
    }());
  }

  if (_commandLine.options.help || !_commandLine.options.src && !_commandLine.options.directory) {
    // print help message if not used properly
    console.log(_commandLine.usage);
  } else if (_commandLine.options.directory) {
    runDir(_commandLine.options);
  } else {
    // didn't use directory mode
    let filenames = _commandLine.options.src;
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
