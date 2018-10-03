import test from 'ava';
import path from 'path';

import inlex from '../dist/index';
import { getRunOptions } from './util/cli-util';
import prepareCleanup from './util/cleanup';
import * as domUtil from './util/dom-util';
import * as fileUtil from './util/file-util';

import fs from 'fs';
import { inspect } from 'util';

/***************************************************************************************************
 * Test Hooks                                                                                      *
 **************************************************************************************************/

let doCleanup;

test.beforeEach('preparing for post-test cleanup', () => {
  doCleanup = prepareCleanup();
});

test.afterEach.always('cleaning up test files', () => {
  doCleanup();
});

/***************************************************************************************************
 * Tests                                                                                           *
 **************************************************************************************************/

// Tests basic cli functionality, runs on one file with minimum required flags
test('output should not have inline styles', t => {
  const args = 'tests/example.jsp -o tests/tests.css -n modified';

  inlex(getRunOptions(args));

  const cleanedDom = domUtil.getDOMFromFile('tests/example.modified.jsp');
  const hasInlineStyles = domUtil.hasInlineStyles(cleanedDom);
  
  t.false(hasInlineStyles, 'Inline styles are still present in output');
});

// Tests directory mode only, all files in a directory should produce modified output files
test('directory mode should run on all files, but not in subdirectories', t => {
  const args = '-d tests/test-files -o tests/tests.css -n modified';

  inlex(getRunOptions(args));

  console.log(path.resolve(__dirname, 'test-files'));

  let tempOutput = 'all modified files:\n';
  tempOutput += `${inspect(fileUtil.getAllModifiedFiles(path.resolve(__dirname, 'test-files')))}\n\n`
  tempOutput += 'modified files in cwd:\n';
  tempOutput += `${inspect(fileUtil.getModifiedFilesInDir(path.resolve(__dirname, 'test-files')))}\n`;

  fs.writeFileSync('temp-debug.txt', tempOutput);

  const modifiedFilesInCwd = fileUtil.getModifiedFilesInDir(path.resolve(__dirname, 'test-files'));
  const hasModifiedFilesInSubDirs = fileUtil.getAllModifiedFiles(path.resolve(__dirname, 'test-files')).filter(file => 
    modifiedFilesInCwd.includes(file)
  ).length > 0;
  
  t.false(hasModifiedFilesInSubDirs, 'Files were modified in subdirectories without recursive flag.');
});