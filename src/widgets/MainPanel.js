const blessed = require('blessed');

const { readLog } = require('../log');
const { formatRows, levelColors } = require('../utils');

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
    this.pageHeight = this.height - 3;
    this.pageWidth = this.width - 2 - 2;
    this.log('pageWidth', this.pageWidth);
    this.update();
  }

  loadFile(file) {
    this.lines = readLog(file);
    this.lastRow = this.lines.length - 1;
    this.log(this.lines.length);
    this.renderLines();
  }

  renderLines() {
    this.rows = this.lines.slice(this.initialRow, this.initialRow + this.height - 2);
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
    if (key.name === 'pagedown') {
      this.pageDown();
      return;
    }
    if (key.name === 'pageup') {
      this.pageUp();
      return;
    }
    if (key.name === 'enter') {
      this.displayDetails();
      return;
    }
    if (ch === '0') {
      this.firstPage();
      return;
    }
    if (ch === '$') {
      this.lastPage();
      return;
    }
  }

  firstPage() {
    this.row = 0;
    this.initialRow = 0;
    this.renderLines();
  }

  lastPage() {
    this.row = this.lastRow;
    this.initialRow = this.row - this.pageHeight;
    this.renderLines();
  }

  pageDown() {
    this.row = Math.min(this.lastRow, this.row + this.pageHeight);
    this.initialRow = this.row;
    this.renderLines();
  }

  pageUp() {
    this.row = Math.max(0, this.row - this.pageHeight);
    this.initialRow = this.row;
    this.log('row', this.row);
    this.log('initialRow', this.initialRow);
    this.renderLines();
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

    const highlight = (row, index) => {
      const str = row.split('\n')[0];
      const relativeRow = this.row - this.initialRow;
      if (index === relativeRow) {
        return `{white-bg}{black-fg}${str}{/}`;
      }
      return str;
    };

    const content = formatRows(
      this.rows, columns, this.colSpacing, this.pageWidth-1).map(highlight).join('\n');
    const list = blessed.element({ tags: true, content });
    this.append(list);
    this.screen.render();
  }
}

module.exports = MainPanel;
