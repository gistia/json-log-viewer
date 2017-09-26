const blessed = require('blessed');
const { readLog } = require('../log');
const { formatRows, padEnd, trunc } = require('../utils');

const levelColors = {
  debug: s => `{cyan-fg}${s}{/cyan-fg}`,
  info: s => `{#ffff94-fg}{bold}${s}{/bold}{/#ffff94-fg}`,
  warn: s => `{orange-fg}${s}{/orange-fg}`,
  error: s => `{red-fg}${s}{/red-fg}`,
};


class BaseWidget extends blessed.Box {
  constructor(opts) {
    super(opts);
    this.screen = opts.screen;
    this.screen.append(this);
  }

  log(...s) {
    this.screen.log(...s);
  }

  setCurrent() {
    this.focus();
    this.screen.render();
    return this;
  }
}

class MainPanel extends BaseWidget {
  constructor(opts={}) {
    super(Object.assign({}, {
      top: 'center',
      left: 'center',
      width: '100%',
      height: '100%',
      content: '',
      tags: true,
      border: { type: 'line' },
      interactive: true,
      padding: { left: 1, right: 1 },
    }, opts));

    this.currentPage = opts.currentPage || 1;
    this.initialRow = opts.initialRow || 0;
    this.colSpacing = opts.colSpacing || 2;
    this.wrap = opts.wrap || true;
    this.row = 0;
    this.rows = [];
    this.pageHeight = this.height;
    this.pageWidth = this.width - 2 - 2;
    this.on('keypress', this.handleKeyPress.bind(this));
    this.log('pageWidth', this.pageWidth);
    this.update();
  }

  loadFile(file) {
    const lines = readLog(file).slice(this.initialRow, this.initialRow + this.height - 2);
    this.log(lines.length);
    this.rows = lines;
    this.update();
  }

  handleKeyPress(ch, key) {
    this.log('ch', ch, 'key', key);

    if (key.name === 'down') {
      this.row += 1;
      this.update();
      return;
    }
    if (key.name === 'up') {
      this.row -= 1;
      this.update();
      return;
    }
    if (key.name === 'w') {
      this.wrap = !this.wrap;
      this.update();
      return;
    }
  }

  update() {
    const columns = [
      { title: 'Timestap', key: 'timestamp' },
      { title: 'Level', key: 'level', format: v => levelColors[v](v) },
      { title: 'Message', key: 'message' },
    ];

    const wrap = (str) => this.wrap
        ? padEnd(trunc(str.split('\n')[0], this.pageWidth-1), this.pageWidth-1)
        : str;

    const formatRow = (row, index) => {
      const str = wrap(row, this.pageWidth-1);
      if (index === this.row) {
        return `{white-bg}{black-fg}${str}{/}`;
      }
      return str;
    };

    const content = formatRows(this.rows, columns, this.colSpacing).map(formatRow).join('\n');
    const list = blessed.element({ tags: true, content });
    this.append(list);
    this.screen.render();
  }
}

module.exports = MainPanel;
