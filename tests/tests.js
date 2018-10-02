import test from 'ava';

import inlex from '../dist/index';
import prepareCleanup from '../util/cleanup';
import domUtil from '../util/dom-util';

var doCleanup;

test.beforeEach('preparing for post-test cleanup...', () => {
  doCleanup = prepareCleanup();
});

test.afterEach('cleaning up test files...', () => {
  doCleanup();
});

test('output should not have inline styles', t => {
  const runOptions = {
    src: 'tests/example.jsp',
    output: 'tests/tests.css'
  };

  inlex(runOptions);


});