#!/usr/bin/env node

const blessed = require('blessed');
const _ = require('lodash');

const { readLog } = require('./log');
const { newBrowser } = require('./browser');

const displayLog = (logFile) => {
  const screen = blessed.screen({ smartCSR: true });

  const browser = newBrowser(readLog(logFile));
  browser.focus();

  screen.append(browser);
  screen.key(['escape', 'q', 'C-c'], function(_ch, _key) {
    return process.exit(0);
  });

  screen.render();
};

displayLog(process.argv[2]);
