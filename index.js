const fs = require('fs');
const { promisify, inspect } = require('util');
const commandLineArgs = require('command-line-args');
const cheerio = require('cheerio');
const nameGenerator = require('unique-names-generator');

// promisified functions
const readFile = promisify(fs.readFile);

// ========================
//   command line options
// ========================
//
// <src> : files to run script on
// <directory>  : directory to run script on
// <recursive>  : whether to operate on subdirectories of directory
// <filetype>   : filetypes to work on (*.jsp, *.html, *.asp, etc)
// <no-replace> : doesn't modify specified files if not null, generates new modified copies instead using the string as the suffix to the filename
// <output>     : name of the css file to put the stripped inline styles in
const optionDefinitions = [
  { name: 'src', type: String, multiple: true, defaultOption: true },
  { name: 'directory', alias: 'd', type: String },
  { name: 'recursive', alias: 'r', type: Boolean },
  { name: 'filetype', alias: 't', type: String },
  { name: 'no-replace', alias: 'n', type: String },
  { name: 'output', alias: 'o', type: String }
];

const options = commandLineArgs(optionDefinitions);

// global hashmap to keep track of classes that have already been created
// this should reduce or eliminate any classes that would otherwise have duplicate properties
const classMap = new Map();

// file loading
const getFileContents = (filename) => {
    return readFile(filename, 'utf8').catch(e => {
      console.error(`Error loading file <${filename}>: ${e}`);
    });
}

// css file write stream
const createCssStream = (filename) => {
  return fs.createWriteStream(filename);
}

// current html document write stream
const createDocumentStream = (filename) => {
  return fs.createWriteStream(filename)
}

// find tags with the undesirables
const getBadStyles = ($) => {
  return $('[style], style').toArray();
}

// takes cheerio's attr object for the inline style, and transforms it to its own class with css syntax
const generateCssClassFromInlineStyle = (className, styleAttr) => {
  const numProperties = styleAttr.split(';').length;
  const styleProperties = styleAttr.split(';').map((property, i) => {
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
  return classMap.has(styleAttr);
}

const inlineStylesToCssFile = (tags, cssFile) => {
  tags.map((tag, i) => {
    if (tag.name === 'style') {
      // take style tag innerText and just move it straight to the css file

      // we'll have to parse the css to get the properties out of it and check to see if we can
      // match any inline styles to currently existing classes
      
    } else {
      const inlineStyle = tag.attribs.style;

      // if there's no matching class, we should create one, put it in the hash map, and write to the css file
      if (!hasMatchingClass(inlineStyle)) {
        const randomClass = nameGenerator.generate('-');
        const cssString = generateCssClassFromInlineStyle(randomClass, inlineStyle);
        classMap.set(inlineStyle, randomClass);
        cssFile.write(cssString);
      }
    }
  });
}

const convertTagsToClass = (tags, htmlFile)

// do the stuff
const run = async () => {
  const cssFile = createCssStream(options.output);

  for (let i = 0; i < options.src.length; i++) {
    let fileContents = await getFileContents(options.src[i]);
    const $ = cheerio.load(fileContents, { xmlMode: true, normalizeWhitespace: true });
    
    const htmlFile = createDocumentStream(htmlOutput);

    const badStyles = getBadStyles($);
    inlineStylesToCssFile(badStyles, cssFile);

    htmlFile.close();
  }

  cssFile.close();
}

// start up the script
run();