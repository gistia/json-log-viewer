#!/usr/bin/env node

const blessed = require('blessed');
const _ = require('lodash');

const { readLog } = require('./log');
const { Browser } = require('./browser');

const displayLog = (logFile) => {
  const screen = blessed.screen({ smartCSR: true });

  new Browser(screen, readLog(logFile));

  screen.key(['q', 'C-c'], function(_ch, _key) {
    return process.exit(0);
  });

  screen.render();
};

displayLog(process.argv[2]);
