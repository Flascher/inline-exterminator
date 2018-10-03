import test from 'ava';

import fs from 'fs';
import { inspect } from 'util';

import inlex from '../dist/index';
import prepareCleanup from './util/cleanup';
import * as domUtil from './util/dom-util';

let doCleanup;

test.beforeEach('preparing for post-test cleanup', () => {
  doCleanup = prepareCleanup();
});

test.afterEach('cleaning up test files', () => {
  doCleanup();
});

test('output should not have inline styles', t => {
  const runOptions = {
    src: ['tests/example.jsp'],
    output: 'tests/tests.css',
    'no-replace': 'modified',
  };

  inlex(runOptions);

  const cleanedDom = domUtil.getDOMFromFile('tests/example.modified.jsp');
  
  const hasStyleAttrs = domUtil.hasAttr(cleanedDom, 'style');
  const hasStyleTags = domUtil.hasTag(cleanedDom, 'style');
  
  t.false(hasStyleAttrs, 'Style attributes found.');
  t.false(hasStyleTags, 'Style tags found.');
});