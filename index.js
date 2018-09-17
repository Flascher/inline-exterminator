const fs = require('fs');
const { promisify, inspect } = require('util');
const commandLineArgs = require('command-line-args');
const cheerio = require('cheerio');
const nameGenerator = require('unique-names-generator');
const pd = require('pretty-data').pd;

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
const styleMap = new Map();

const printStyleMap = () => {
  console.log('styleMap:')
  styleMap.forEach((v, k) => {
    console.log(` ${k} => ${v}`);
  });
}

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
  let stream;

  // check if the file exists, if it doesn't create it
  if (!fs.existsSync(`${__dirname}/${filename}`)) {
    fs.appendFileSync(filename);
  }
  
  stream = fs.createWriteStream(filename);
  return stream;
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
const getBadStyles = ($) => {
  return $('[style], style').toArray();
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
  }
  // if there's no matching class, we should create one, put it in the hash map, and write to the css file
  else if (!hasMatchingClass(minifiedCss)) {
    const randomClass = nameGenerator.generate('-');
    key = minifiedCss;
    // remove whitespace from properties for format-agnostic duplicate checking
    value = randomClass;
  }

  styleMap.set(key, value);
}

const styleMapToCssFile = (filename) => {
  // key = styles (no whitespace) that belong to a class
  // value = the class name that contains the styles in its key
  styleMap.forEach((v, k) => {
    const cssString = generateCssClassFromInlineStyle(v, k);
    fs.appendFileSync(options.output, cssString);
  });

}

const inlineStylesToStyleMap = (tags) => {
  tags.map((tag, i) => {
    if (tag.name === 'style') {
      // this if case handles style tags

      // take style tag innerText and just move it straight to the css file
      let styles = tag.children[0].data;

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

      const inlineStyle = tag.attribs.style;
      addStyleToMap(removeWhitespace(inlineStyle));
    }
  });
}

const cleanHtmlTags = ($) => {
  // clean up inline style attributes
  const styleAttrs = $('[style]');

  styleAttrs.toArray().forEach((styleAttr) => {
    const className = styleMap.get(styleAttr.attribs.style);
    
    $(styleAttr).removeAttr('style');
    $(styleAttr).addClass(className);
  });

  // clean up inline style tags
  // tags have already been moved over to the css file output by
  // inlineStylesToStyleMap and styleMapToCssFile
  // so we just need to delete any style tags
  $('style').remove();
}

const cheerioToFile = ($, htmlOutput) => {
  fs.appendFileSync(htmlOutput, pd.xml($.html()));
}

// do the stuff
const run = async () => {
  for (let i = 0; i < options.src.length; i++) {
    let fileContents = await getFileContents(options.src[i]);
    const $ = cheerio.load(fileContents, { xmlMode: true, normalizeWhitespace: true });
    
    const badStyles = getBadStyles($);
    inlineStylesToStyleMap(badStyles);
    
    styleMapToCssFile(options.output);
    
    const htmlOutput = options['no-replace'] === undefined
      ? options.src[i]
      : createModifiedName(options.src[i], options['no-replace']);

    cleanHtmlTags($);
    cheerioToFile($, htmlOutput);
  }
}

// start up the script
run();