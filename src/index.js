import blessed from 'blessed';
import _ from 'lodash';

import { readLog } from './log';
import { newBrowser } from './browser';

const screen = blessed.screen({ smartCSR: true });

const browser = newBrowser(readLog('/Users/fcoury/code/workflow-engine/logs/workflow-engine.log.2017-09-25'));
browser.focus();

screen.append(browser);
screen.key(['escape', 'q', 'C-c'], function(_ch, _key) {
  return process.exit(0);
});

screen.render();
