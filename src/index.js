#!/usr/bin/env node
const blessed = require('blessed');
const fs = require('fs');
const _ = require('lodash');
require('./polyfills');

const screen = blessed.screen({
  smartCSR: true,
  log: '/Users/fcoury/logs/jv.log',
});
screen.key(['q', 'C-c'], function(_ch, _key) {
  return process.exit(0);
});

const MainPanel = require('./widgets/MainPanel');

const main = new MainPanel({ screen });
main.loadFile(process.argv[2]);
// main.setCurrent();
