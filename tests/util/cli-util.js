import commandLineArgs from 'command-line-args';

import { optionDefinitions } from '../../dist/command-line';

// converts a string that you would type on the command line
// into the object used internally by the script
const getRunOptions = (cliOptions) => {
  return commandLineArgs(optionDefinitions, { argv: cliOptions.split(' ') });
}

export { getRunOptions };