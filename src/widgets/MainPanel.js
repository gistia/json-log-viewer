const blessed = require('blessed');

const { readLog } = require('../log');
const { formatRows, padEnd, trunc, levelColors } = require('../utils');

const BaseWidget = require('./BaseWidget');
const LogDetails = require('./LogDetails');

class MainPanel extends BaseWidget {
  constructor(opts={}) {
    super(Object.assign({}, { handleKeys: true }, opts));

    this.currentPage = opts.currentPage || 1;
    this.initialRow = opts.initialRow || 0;
    this.colSpacing = opts.colSpacing || 2;
    this.wrap = opts.wrap || true;
    this.row = 0;
    this.rows = [];
    this.pageHeight = this.height;
    this.pageWidth = this.width - 2 - 2;
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
    if (key.name === 'enter') {
      this.displayDetails();
      return;
    }
  }

  displayDetails() {
    const details = new LogDetails({ screen: this.screen });
    details.display(this.rows[this.row]);
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
