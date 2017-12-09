#!/usr/bin/env node
const minimist = require('minimist');
const blessed = require('blessed');
const _ = require('lodash');

const MainPanel = require('./widgets/MainPanel');
const StatusLine = require('./widgets/StatusLine');
const Reader = require('./core/reader');

const opts = minimist(process.argv.slice(2));
const logFile = opts._[0];

if (!logFile) {
  // eslint-disable-next-line no-console
  console.log('error: missing log file');
  process.exit(1);
}

const screen = blessed.screen({
  smartCSR: true,
  log: '/Users/fcoury/logs/jv1.log',
});
screen.key(['C-c'], function(_ch, _key) {
  return process.exit(0);
});

global.log = (...s) => screen.log(s.map(s => s.toString()).join(' '));

const reader = new Reader(logFile);

const mainPanel = new MainPanel({ screen, reader });
const statusLine = new StatusLine({ screen, reader, mainPanel });
screen.append(statusLine);

mainPanel.setCurrent();

screen.render();
