import { waitForInput } from './command-line';

const validHtmlTags = [
  '!--',
  '!DOCTYPE',
  'a',
  'abbr',
  'acronym',
  'address',
  'applet',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'basefont',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'datalist',
  'dd',
  'del',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'frame',
  'frameset',
  'head',
  'header',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'p',
  'param',
  'pre',
  'progress',
  'q',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strike',
  'strong',
  'style',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'u',
  'ul',
  'var',
  'video',
  'wbr'
];

const foundTags = new Map();

const createClosingTag = (tagname, closingTagStr) => {
  return closingTagStr.replace(/\[name\]/, tagname);
}

const handleNonStandardTags = async function(tagname, filename, linenumber) {
  if (!foundTags.has(tagname)) {
    // newly encountered non-standard tag
    if (foundTags.size === 0) {
      // first encounter example prompt
      console.log('Non-standard HTML tag(s) have been found.\n');
      console.log('In order to preserve potentially crucial serverside elements');
      console.log('your manual input is required. Please indicate the structure');
      console.log('of the tag like the following example:\n');
      console.log('<taglib:test></taglib:test>')
      console.log('would become:\n');
      console.log('</[name]>');
      console.log('[name] will be replaced with the tagname for the current tag (taglib:test)');
      console.log('Input is optional. If no input is entered the closing tag would not exist.\n');
    }

    // pad for a maximum of 5 digit linenumbers (: + 5 digit line number = 6) 
    // more than 100k lines should theoretically be supported, but its unlikely and
    // will just result in slightly less pretty formatting when asking for input
    const locationPrompt = `${filename}:${linenumber}`.padEnd(filename.length + 6);
    const answer = await waitForInput(`${locationPrompt} | tag: <${tagname} : `);

    foundTags.set(tagname, createClosingTag(tagname, answer));
  }
}

const getTagMap = () => {
  return foundTags;
}

export {
  handleNonStandardTags,
  validHtmlTags,
  getTagMap
};