"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "commandLineUsage", {
  enumerable: true,
  get: function () {
    return _commandLineUsage.default;
  }
});
exports.usage = exports.options = exports.optionDefinitions = void 0;

var _commandLineArgs = _interopRequireDefault(require("command-line-args"));

var _commandLineUsage = _interopRequireDefault(require("command-line-usage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const packageName = 'inline-exterminator';
const packageAlias = 'inlex'; // ========================
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
  type: String,
  multiple: true
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
exports.optionDefinitions = optionDefinitions;
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
      desc: `2. No-replace flag. The file being operated on (example.html) will not be modified. example.clean.html will be created.\n`,
      example: `${packageName} example.html --output example.css --no-replace clean`
    }, {
      desc: `3. Directory flag. ${packageName} will run on the specified directory (relative to the directory you're running it from)\n`,
      example: `${packageAlias} -d my-dirty-html -o example.css`
    }, {
      desc: `4. Filetype flag. Used in conjunction with the directory flag, it will run on all files in the directory with the specified file extension.`,
      example: `${packageAlias} -d my-dirty-html -t *.html -o example.css`
    }, {
      desc: `5. Recursive flag. Used in conjunction with directory mode, using this flag tells ${packageName} to run in the specified directory and all subdirectories.`,
      example: `${packageAlias} -rd my-dirt-html -o example.css`
    }]
  }
}];
const usage = (0, _commandLineUsage.default)(sections);
exports.usage = usage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21tYW5kLWxpbmUuanMiXSwibmFtZXMiOlsicGFja2FnZU5hbWUiLCJwYWNrYWdlQWxpYXMiLCJvcHRpb25EZWZpbml0aW9ucyIsIm5hbWUiLCJ0eXBlIiwiU3RyaW5nIiwibXVsdGlwbGUiLCJkZWZhdWx0T3B0aW9uIiwiYWxpYXMiLCJCb29sZWFuIiwib3B0aW9ucyIsInNlY3Rpb25zIiwiaGVhZGVyIiwiY29udGVudCIsIm9wdGlvbkxpc3QiLCJ0eXBlTGFiZWwiLCJkZXNjcmlwdGlvbiIsIm1heFdpZHRoIiwiZGF0YSIsImRlc2MiLCJleGFtcGxlIiwidXNhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUVBLE1BQU1BLFdBQVcsR0FBRyxxQkFBcEI7QUFDQSxNQUFNQyxZQUFZLEdBQUcsT0FBckIsQyxDQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLE1BQU1DLGlCQUFpQixHQUFHLENBQ3RCO0FBQUVDLEVBQUFBLElBQUksRUFBRSxLQUFSO0FBQWVDLEVBQUFBLElBQUksRUFBRUMsTUFBckI7QUFBNkJDLEVBQUFBLFFBQVEsRUFBRSxJQUF2QztBQUE2Q0MsRUFBQUEsYUFBYSxFQUFFO0FBQTVELENBRHNCLEVBRXRCO0FBQUVKLEVBQUFBLElBQUksRUFBRSxXQUFSO0FBQXFCSyxFQUFBQSxLQUFLLEVBQUUsR0FBNUI7QUFBaUNKLEVBQUFBLElBQUksRUFBRUM7QUFBdkMsQ0FGc0IsRUFHdEI7QUFBRUYsRUFBQUEsSUFBSSxFQUFFLFdBQVI7QUFBcUJLLEVBQUFBLEtBQUssRUFBRSxHQUE1QjtBQUFpQ0osRUFBQUEsSUFBSSxFQUFFSztBQUF2QyxDQUhzQixFQUl0QjtBQUFFTixFQUFBQSxJQUFJLEVBQUUsVUFBUjtBQUFvQkssRUFBQUEsS0FBSyxFQUFFLEdBQTNCO0FBQWdDSixFQUFBQSxJQUFJLEVBQUVDLE1BQXRDO0FBQThDQyxFQUFBQSxRQUFR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QUFHLDZJQURYO0FBRUlDLE1BQUFBLE9BQU8sRUFBRyxHQUFFbkIsWUFBYTtBQUY3QixLQWJFLEVBaUJGO0FBQ0lrQixNQUFBQSxJQUFJLEVBQUcscUZBQW9GbkIsV0FBWSw0REFEM0c7QUFFSW9CLE1BQUFBLE9BQU8sRUFBRyxHQUFFbkIsWUFBYTtBQUY3QixLQWpCRTtBQUZEO0FBRmIsQ0F6RGEsQ0FBakI7QUF1RkEsTUFBTW9CLEtBQUssR0FBRywrQkFBaUJWLFFBQWpCLENBQWQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY29tbWFuZExpbmVBcmdzIGZyb20gJ2NvbW1hbmQtbGluZS1hcmdzJztcbmltcG9ydCBjb21tYW5kTGluZVVzYWdlIGZyb20gJ2NvbW1hbmQtbGluZS11c2FnZSc7XG5cbmNvbnN0IHBhY2thZ2VOYW1lID0gJ2lubGluZS1leHRlcm1pbmF0b3InO1xuY29uc3QgcGFja2FnZUFsaWFzID0gJ2lubGV4JztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09XG4vLyAgIGNvbW1hbmQgbGluZSBvcHRpb25zXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyA8c3JjPiA6IGZpbGVzIHRvIHJ1biBzY3JpcHQgb25cbi8vIDxkaXJlY3Rvcnk+ICA6IGRpcmVjdG9yeSB0byBydW4gc2NyaXB0IG9uXG4vLyA8cmVjdXJzaXZlPiAgOiB3aGV0aGVyIHRvIG9wZXJhdGUgb24gc3ViZGlyZWN0b3JpZXMgb2YgZGlyZWN0b3J5XG4vLyA8ZmlsZXR5cGU+ICAgOiBmaWxldHlwZXMgdG8gd29yayBvbiAoKi5qc3AsICouaHRtbCwgKi5hc3AsIGV0Yylcbi8vIDxuby1yZXBsYWNlPiA6IGRvZXNuJ3QgbW9kaWZ5IHNwZWNpZmllZCBmaWxlcyBpZiBub3QgbnVsbCwgZ2VuZXJhdGVzIG5ldyBtb2RpZmllZCBjb3BpZXMgaW5zdGVhZCB1c2luZyB0aGUgc3RyaW5nIGFzIHRoZSBzdWZmaXggdG8gdGhlIGZpbGVuYW1lXG4vLyA8b3V0cHV0PiAgICAgOiBuYW1lIG9mIHRoZSBjc3MgZmlsZSB0byBwdXQgdGhlIHN0cmlwcGVkIGlubGluZSBzdHlsZXMgaW5cbmNvbnN0IG9wdGlvbkRlZmluaXRpb25zID0gW1xuICAgIHsgbmFtZTogJ3NyYycsIHR5cGU6IFN0cmluZywgbXVsdGlwbGU6IHRydWUsIGRlZmF1bHRPcHRpb246IHRydWUgfSxcbiAgICB7IG5hbWU6ICdkaXJlY3RvcnknLCBhbGlhczogJ2QnLCB0eXBlOiBTdHJpbmcgfSxcbiAgICB7IG5hbWU6ICdyZWN1cnNpdmUnLCBhbGlhczogJ3InLCB0eXBlOiBCb29sZWFuIH0sXG4gICAgeyBuYW1lOiAnZmlsZXR5cGUnLCBhbGlhczogJ3QnLCB0eXBlOiBTdHJpbmcsIG11bHRpcGxlOiB0cnVlIH0sXG4gICAgeyBuYW1lOiAnbm8tcmVwbGFjZScsIGFsaWFzOiAnbicsIHR5cGU6IFN0cmluZyB9LFxuICAgIHsgbmFtZTogJ291dHB1dCcsIGFsaWFzOiAnbycsIHR5cGU6IFN0cmluZyB9LFxuICAgIHsgbmFtZTogJ2hlbHAnLCBhbGlhczogJ2gnLCB0eXBlOiBCb29sZWFuIH1cbiAgXTtcbiAgXG5jb25zdCBvcHRpb25zID0gY29tbWFuZExpbmVBcmdzKG9wdGlvbkRlZmluaXRpb25zKTtcbiAgXG5jb25zdCBzZWN0aW9ucyA9IFtcbiAgICB7XG4gICAgICAgIGhlYWRlcjogcGFja2FnZU5hbWUsXG4gICAgICAgIGNvbnRlbnQ6IGBUaGlzIHNjcmlwdCB3aWxsIHJ1biB0aHJvdWdoIEhUTUwgYW5kIHJlbW92ZSBpbmxpbmUgc3R5bGUgYXR0cmlidXRlcyBhbmQgXG4gICAgICAgICAgICB0YWdzLCBhbmQgbW92ZSB0aGVtIHRvIGEgc3BlY2lmaWVkIGNzcyBmaWxlLiBUaGUgcmVtb3ZlZCBzdHlsZXMgd2lsbCBiZSByZXBsYWNlZCBcbiAgICAgICAgICAgIHdpdGggcmFuZG9tIGNsYXNzIG5hbWVzIGluIHRoZSBIVE1MLiBEdXBsaWNhdGUgaW5saW5lIHN0eWxlcyB3aWxsIHVzZSB0aGUgc2FtZSBcbiAgICAgICAgICAgIGNsYXNzZXMuICR7cGFja2FnZU5hbWV9XFwncyBnb2FsIGlzIHRvIGNyZWF0ZSBtb3JlIGVhc2lseSBtYWludGFuYWJsZSBjb2RlLmBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaGVhZGVyOiAnT3B0aW9ucycsXG4gICAgICAgIG9wdGlvbkxpc3Q6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3JjJyxcbiAgICAgICAgICAgICAgICB0eXBlTGFiZWw6ICd7dW5kZXJsaW5lIGZpbGV9JyxcbiAgICAgICAgICAgICAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0T3B0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGZpbGUocykgdG8gcnVuIHRoaXMgc2NyaXB0IG9uLiBtdWx0aXBsZSBmaWxlcyBjYW4gYmUgc3BlY2lmaWVkIGJ5IHJlcGVhdGluZyB0aGUgLS1zcmMgZmxhZy5cXG4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdkaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIHR5cGVMYWJlbDogJ3t1bmRlcmxpbmUgZGlyfScsXG4gICAgICAgICAgICAgICAgYWxpYXM6ICdkJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJyhOb3QgeWV0IGltcGxlbWVudGVkKSBUaGUgZGlyZWN0b3J5IHRvIHJ1biB0aGlzIHNjcmlwdCBvbi4gRG9lc25cXCd0IHdvcmsgd2l0aG91dCB0aGUgLS1maWxldHlwZSAnICtcbiAgICAgICAgICAgICAgICAnb3B0aW9uIHRvIGF2b2lkIG9wZXJhdGluZyBvbiBldmVyeSBmaWxlLlxcbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3JlY3Vyc2l2ZScsXG4gICAgICAgICAgICAgICAgYWxpYXM6ICdyJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYChOb3QgeWV0IGltcGxlbWVudGVkKSBJZiB0aGlzIG9wdGlvbiBpcyB1c2VkICR7cGFja2FnZU5hbWV9IHdpbGwgd29yayByZWN1cnNpdmVseSB0aHJvdWdoIGFsbCBkaXJlY3RvcmllcyBzdGFydGluZyB3aXRoIHRoZSBkaXJlY3RvcnkgdGhlIHNjcmlwdCBpcyBydW4gaW4gYXMgdGhlIHJvb3QgZGlyZWN0b3J5LlxcbmBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2ZpbGV0eXBlJyxcbiAgICAgICAgICAgICAgICBhbGlhczogJ3QnLFxuICAgICAgICAgICAgICAgIHR5cGVMYWJlbDogJ3t1bmRlcmxpbmUgZmlsZXR5cGV9JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJyhOb3QgeWV0IGltcGxlbWVudGVkKSBUaGUgZmlsZSB0eXBlIHRvIGxpbWl0IG9wZXJhdGlvbnMgdG8uIFRoaXMgd2lsbCBwcmV2ZW50IElBIGZyb20gJyArXG4gICAgICAgICAgICAgICAgJ21vZGlmeWluZyBldmVyeSBmaWxlIHdoaWxlIGl0IGF0dGVtcHRzIHRvIHJlbW92ZSBpbmxpbmUgc3R5bGVzLlxcbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ25vLXJlcGxhY2UnLFxuICAgICAgICAgICAgICAgIGFsaWFzOiAnbicsXG4gICAgICAgICAgICAgICAgdHlwZUxhYmVsOiAne3VuZGVybGluZSBzdWZmaXh9JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBzdWZmaXggdG8gYWRkIG9udG8gdGhlIGVuZCBvZiB0aGUgaHRtbCBmaWxlcyBpdCB3b3VsZCBvdGhlcndpc2UgbW9kaWZ5IGRpcmVjdGx5ICcgK1xuICAgICAgICAgICAgICAgICdpLmUuOiB0ZXN0Lmh0bWwgd291bGQgYmVjb21lIHRlc3Que3VuZGVybGluZSBzdWZmaXh9Lmh0bWxcXG4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdvdXRwdXQnLFxuICAgICAgICAgICAgICAgIGFsaWFzOiAnbycsXG4gICAgICAgICAgICAgICAgdHlwZUxhYmVsOiAne3VuZGVybGluZSBmaWxlbmFtZS5jc3N9JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIHNhdmUgdGhlIGV4dHJhY3RlZCBpbmxpbmUgc3R5bGVzIGluLiBUaGlzIHdpbGwgYmUgZm9ybWF0dGVkIGFzIHZhbmlsbGEgQ1NTLlxcbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2hlbHAnLFxuICAgICAgICAgICAgICAgIGFsaWFzOiAnaCcsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcmludCB0aGlzIGhlbHAgbWVzc2FnZS5cXG4nXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaGVhZGVyOiAnRXhhbXBsZXMnLFxuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICBvcHRpb25zOiB7IG1heFdpZHRoOiAxNTAgfSxcbiAgICAgICAgICAgIGRhdGE6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2M6IGAxLiBCYXNpYyB1c2FnZS4gLS1zcmMgY2FuIGJlIG9tbWl0dGVkIGlmICR7cGFja2FnZU5hbWV9IHVzZWQgb24gb25seSBvbmUgZmlsZVxcbmAsXG4gICAgICAgICAgICAgICAgICAgIGV4YW1wbGU6IGAke3BhY2thZ2VOYW1lfSBleGFtcGxlLmh0bWwgLS1vdXRwdXQgZXhhbXBsZS5jc3NgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2M6IGAyLiBOby1yZXBsYWNlIGZsYWcuIFRoZSBmaWxlIGJlaW5nIG9wZXJhdGVkIG9uIChleGFtcGxlLmh0bWwpIHdpbGwgbm90IGJlIG1vZGlmaWVkLiBleGFtcGxlLmNsZWFuLmh0bWwgd2lsbCBiZSBjcmVhdGVkLlxcbmAsXG4gICAgICAgICAgICAgICAgICAgIGV4YW1wbGU6IGAke3BhY2thZ2VOYW1lfSBleGFtcGxlLmh0bWwgLS1vdXRwdXQgZXhhbXBsZS5jc3MgLS1uby1yZXBsYWNlIGNsZWFuYFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkZXNjOiBgMy4gRGlyZWN0b3J5IGZsYWcuICR7cGFja2FnZU5hbWV9IHdpbGwgcnVuIG9uIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IChyZWxhdGl2ZSB0byB0aGUgZGlyZWN0b3J5IHlvdSdyZSBydW5uaW5nIGl0IGZyb20pXFxuYCxcbiAgICAgICAgICAgICAgICAgICAgZXhhbXBsZTogYCR7cGFja2FnZUFsaWFzfSAtZCBteS1kaXJ0eS1odG1sIC1vIGV4YW1wbGUuY3NzYFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkZXNjOiBgNC4gRmlsZXR5cGUgZmxhZy4gVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSBkaXJlY3RvcnkgZmxhZywgaXQgd2lsbCBydW4gb24gYWxsIGZpbGVzIGluIHRoZSBkaXJlY3Rvcnkgd2l0aCB0aGUgc3BlY2lmaWVkIGZpbGUgZXh0ZW5zaW9uLmAsXG4gICAgICAgICAgICAgICAgICAgIGV4YW1wbGU6IGAke3BhY2thZ2VBbGlhc30gLWQgbXktZGlydHktaHRtbCAtdCAqLmh0bWwgLW8gZXhhbXBsZS5jc3NgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2M6IGA1LiBSZWN1cnNpdmUgZmxhZy4gVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGRpcmVjdG9yeSBtb2RlLCB1c2luZyB0aGlzIGZsYWcgdGVsbHMgJHtwYWNrYWdlTmFtZX0gdG8gcnVuIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGFuZCBhbGwgc3ViZGlyZWN0b3JpZXMuYCxcbiAgICAgICAgICAgICAgICAgICAgZXhhbXBsZTogYCR7cGFja2FnZUFsaWFzfSAtcmQgbXktZGlydC1odG1sIC1vIGV4YW1wbGUuY3NzYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH1cbl07XG5cbmNvbnN0IHVzYWdlID0gY29tbWFuZExpbmVVc2FnZShzZWN0aW9ucyk7XG5cbmV4cG9ydCB7IFxuICBvcHRpb25EZWZpbml0aW9ucyxcbiAgb3B0aW9ucyxcbiAgY29tbWFuZExpbmVVc2FnZSxcbiAgdXNhZ2Vcbn07Il19