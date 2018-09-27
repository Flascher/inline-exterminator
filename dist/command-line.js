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