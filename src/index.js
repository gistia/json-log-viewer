#!/usr/bin/env node
const minimist = require('minimist');
const blessed = require('blessed');
const _ = require('lodash');
require('./polyfills');

const MainPanel = require('./widgets/MainPanel');

const opts = minimist(process.argv.slice(2));
const logFile = opts._[0];

if (!logFile) {
  // eslint-disable-next-line no-console
  console.log('error: missing log file');
  process.exit(1);
}

const screen = blessed.screen({
  smartCSR: true,
  log: opts.log,
});
screen.key(['q', 'C-c'], function(_ch, _key) {
  return process.exit(0);
});

const level = opts.l || opts.level;
const args = { screen, level };
const main = new MainPanel(args);
main.loadFile(logFile);
main.setCurrent();
