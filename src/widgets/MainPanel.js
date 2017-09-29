const blessed = require('blessed');
const _ = require('lodash');

const { formatRows, levelColors } = require('../utils');
const { readChunk, countLines } = require('../file');
const FileBuffer = require('../buffer');

const BaseWidget = require('./BaseWidget');
const LogDetails = require('./LogDetails');
const Picker = require('./Picker');

const FIELDS = ['timestamp', 'level', 'message'];

class MainPanel extends BaseWidget {
  constructor(opts={}) {
    super(Object.assign({}, { top: '0', height: '99%', handleKeys: true }, opts));

    this.file = opts.file;
    this.currentPage = opts.currentPage || 1;
    this.initialRow = opts.initialRow || 0;
    this.colSpacing = opts.colSpacing || 2;
    this.wrap = opts.wrap || true;
    this.row = 0;
    this.rows = [];
    this.lastSearchTerm = null;
    this.levelFilter = opts.level;
    this.filters = [];
    this.sort = opts.sort || '-timestamp';
    this.mode = 'normal';
    this.updated = true;
    this.loading = false;
    this.lastRow = null;
    this.fileBuffer = new FileBuffer(this.file, { log: this.log.bind(this) });

    this.log('pageWidth', this.pageWidth);
    this.on('resize', () => {
      this.screen.render();
      this.fixCursor();
      this.renderLines();
    });
    this.readLines();
  }

  get pageHeight() { return this.height - 3; };
  get pageWidth() { return this.width - 2 - 2; };

  setLoading() {
    this.loading = true;
    this.emit('update');
  }

  clearLoading() {
    this.loading = false;
    this.emit('update');
  }

  readLines() {
    const file = this.file;
    const start = this.initialRow;
    const length = this.pageHeight + 1;
    const filters = _.cloneDeep(this.filters);

    this.setLoading();

    if (this.levelFilter) {
      filters.push({ key: 'level', value: this.levelFilter } );
    }

    const filter = row => {
      const line = JSON.parse(row);
      return filters.reduce((bool, filter) => {
        const key = FIELDS.indexOf(filter.key) > -1
          ? filter.key : `data.${filter.key}`;
        const value = _.get(line, key);
        if (!value) { return false; }
        if (!filter.method) {
          return value && value === filter.value;
        }
        if (filter.method === 'contains') {
          return value && value.toString().toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
        }
      }, true);
    };

    countLines(file, n => {
      this.lastRow = n - 1;
      this.emit('update');
    });

    this.log('readLines', filters);

    this.fileBuffer.get(start, length, lines => {
      this.lines = lines;
      this.renderLines();
      this.clearLoading();
    });
    // readChunk({ file, start, length, filter, log: (...s) => this.log(...s) }, lines => {
    //   this.lines = lines;
    //   this.renderLines();
    //   this.clearLoading();
    // });
  }

  calcLines() {
    if (!this.rawLines) {
      return [];
    }

    this.log('calcLines', this.sort, this.filters, this.levelFilter);

    const sort = (lines) => {
      if (!this.sort) { return lines; }

      const sorted = _.chain(lines).sortBy(this.sortKey);
      if (this.sort.startsWith('-')) {
        return sorted.reverse().value();
      }

      return sorted.value();
    };

    const filters = _.cloneDeep(this.filters);
    if (this.levelFilter) {
      filters.push({ key: 'level', value: this.levelFilter } );
    }

    if (!filters.length) {
      return sort(this.rawLines);
    }

    this.log('filters', filters);

    return sort(this.rawLines.filter(line => {
      return filters.reduce((bool, filter) => {
        const key = FIELDS.indexOf(filter.key) > -1
          ? filter.key : `data.${filter.key}`;
        const value = _.get(line, key);
        if (!value) { return false; }
        if (!filter.method) {
          return value && value === filter.value;
        }
        if (filter.method === 'contains') {
          return value && value.toString().toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
        }
      }, true);
    }));
  }

  renderLines(notify=true) {
    this.log('renderLines');
    this.resetMode();
    this.update(notify);
  }

  handleKeyPress(ch, key) {
    this.log('key', ch || (key && key.name));

    if (key.name === 'down') {
      this.moveDown();
      return;
    }
    if (key.name === 'up') {
      this.moveUp();
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
      this.log('pageup triggering...');
      this.pageUp();
      return;
    }
    if (key.name === 'enter') {
      this.displayDetails();
      return;
    }
    if (ch === '0') {
      this.moveToFirstLine();
      return;
    }
    if (ch === '$') {
      this.lastPage();
      return;
    }
    if (ch === '/') {
      this.openSearch(true);
      return;
    }
    if (ch === '?') {
      this.openSearch();
      return;
    }
    if (ch === 'n') {
      this.search();
      return;
    }
    if (ch === 'l') {
      this.openLevelFilter();
      return;
    }
    if (ch === 'g') {
      this.openGoToLine();
      return;
    }
    if (ch === 's') {
      this.openSort();
      return;
    }
    if (ch === 'f') {
      if (this.filters.length || this.levelFilter) {
        return this.clearFilters();
      }
      this.openFilter();
      return;
    }
    if (ch === 'q') {
      process.exit(0);
      return;
    }
    if (ch === 'A') {
      this.moveToFirstViewportLine();
      return;
    }
    if (ch === 'G') {
      this.moveToLastViewportLine();
      return;
    }
    if (ch === 'C') {
      this.moveToCenterViewportLine();
      return;
    }
  }

  openLevelFilter() {
    const levels = ['all', 'debug', 'info', 'warn', 'error'];
    this.openPicker('Log Level', levels, (err, level) => {
      if (!level) { return; }
      if (err) { return; }

      this.log('selected', level);
      if (level === 'all') {
        return this.clearFilters();
      }
      this.setLevelFilter(level);
    });
  }

  get sortKey() {
    return this.sort && this.sort.replace(/^-/, '');
  }

  get sortAsc() {
    return !/^-/.test(this.sort);
  }

  openSort() {
    this.setMode('sort');
    this.openPicker('Sort by', FIELDS, (err, sort) => {
      if (!sort) { return this.resetMode(); }
      if (err) { return; }
      if (this.sortKey === sort && this.sortAsc) {
        return this.setSort(`-${sort}`);
      }
      this.setSort(sort);
    });
  }

  setUpdated() {
    this.updated = true;
    this.emit('update');
  }

  setMode(mode) {
    this.mode = mode;
    this.emit('update');
  }

  resetMode() {
    this.setMode('normal');
  }

  openFilter() {
    this.setMode('filter');
    const fields = ['timestamp', 'level', 'message', 'other'];
    this.openPicker('Filter by', fields, (err, field) => {
      if (err || !field) { return this.resetMode(); }
      if (field === 'level') {
        return this.openLevelFilter();
      }
      if (field === 'other') {
        return this.openCustomFilter();
      }
      this.openFilterTerm(field);
    });
  }

  openCustomFilter() {
    this.prompt(`Field to filter:`, '', (field) => {
      if (!field) { return this.resetMode(); }
      if (field.indexOf(':') > -1) {
        return this.setFilter(field.split(':')[0], field.split(':')[1], 'contains');
      }
      this.openFilterTerm(field);
    });
  }

  openFilterTerm(field) {
    this.prompt(`Filter ${field} by:`, '', (value) => {
      if (!value) { return this.resetMode(); }
      this.setFilter(field, value, 'contains');
    });
  }

  setSort(sort) {
    this.sort = sort;
    this.renderLines();
  }

  setLevelFilter(level) {
    this.levelFilter = level;
    this.filterChanged();
  }

  filterChanged() {
    this.row = 0;
    this.initialRow = 0;
    this.setUpdated();
    this.readLines();
  }

  setFilter(key, value, method) {
    this.filters = [{ key, value, method }];
    this.filterChanged();
  }

  clearFilters() {
    this.levelFilter = null;
    this.filters = [];
    this.filterChanged();
  }

  openPicker(label, items, callback) {
    const picker = new Picker(this, { label, items, keySelect: true });
    picker.on('select', (err, value) => callback(null, value));
    picker.setCurrent();
  }

  prompt(str, value, callback) {
    const prompt = blessed.prompt({
      parent: this,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ' {blue-fg}Prompt{/blue-fg} ',
      tags: true,
      keys: true,
      vi: true,
      padding: 1,
    });

    prompt.input(str, value || '', (err, value) => {
      if (err) { return; }
      if (value) {
        callback(value);
      } else {
        this.renderLines();
      }
    });
  }

  openSearch(clear=false) {
    this.setMode('search');
    if (clear) {
      this.lastSearchTerm = null;
    }
    this.prompt('Search:', this.lastSearchTerm, (value) => this.search(value));
  }

  openGoToLine() {
    this.setMode('GOTO');
    this.prompt('Line:', '', (value) => this.moveToLine(parseInt(value, 10)-1));
  }

  searchTerm(term, caseSensitive, startRow) {
    const searchTerm = caseSensitive ? term : term.toLowerCase();
    return this.lines.findIndex((json, index) => {
      if (index < startRow) {
        return false;
      }
      const match = caseSensitive
        ? `${json.timestamp} ${json.message}`
        : `${json.timestamp} ${json.message}`.toLowerCase();
      return match.indexOf(searchTerm) > -1;
    });
  }

  message(str) {
    var msg = blessed.question({
      parent: this,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ' {blue-fg}Message{/blue-fg} ',
      tags: true,
      keys: true,
      hidden: true,
      vi: true,
      padding: 1,
    });

    msg.ask(str, (err, value) => {
      this.log('value', value);
      this.renderLines();
    });
  }

  search(term=this.lastSearchTerm) {
    if (!term) {
      return this.message('No previous search');
    }
    this.lastSearchTerm = term;
    const pos = this.searchTerm(term, false, this.row+1);
    if (pos > -1) {
      this.moveToLine(pos);
    } else {
      this.message(`No matches for '${term}'`);
    }
  }

  moveToLine(num) {
    this.row = num;
    this.initialRow = num;
    this.readLines();
  }

  moveToFirstLine() {
    this.moveToLine(0);
  }

  isOutsideViewPort() {
    return this.row > this.initialRow + this.pageHeight;
  }

  fixCursor() {
    if (this.isOutsideViewPort()) {
      this.initialRow = this.row - this.pageHeight;
    }
  }

  moveToFirstViewportLine() {
    this.row = this.initialRow;
    this.renderLines();
  }

  moveToCenterViewportLine() {
    this.row = parseInt((this.initialRow + this.pageHeight) / 2, 10);
    this.renderLines();
  }

  moveToLastViewportLine() {
    this.row = this.initialRow + this.pageHeight;
    this.renderLines();
  }

  moveUp() {
    this.row = Math.max(0, this.row - 1);
    const outside = this.row < this.initialRow;
    if (outside) {
      this.initialRow -= 1;
      return this.readLines();
    }
    this.renderLines(outside);
  }

  moveDown() {
    this.row = this.lastRow ? Math.min(this.lastRow, this.row + 1) : this.row + 1;
    const outside = this.row > this.lastVisibleLine;
    if (outside) {
      this.initialRow += 1;
      return this.readLines();
    }
    this.renderLines(outside);
  }

  lastPage() {
    this.row = this.lastRow;
    this.initialRow = this.row - this.pageHeight;
    this.renderLines();
  }

  pageDown() {
    if (this.lastRow && (this.initialRow + this.pageHeight > this.lastRow)) {
      this.row = this.lastRow;
      return;
    }
    const relativeRow = this.relativeRow;
    this.initialRow += this.pageHeight;
    this.row = this.initialRow + relativeRow;
    this.readLines();
  }

  pageUp() {
    if (this.initialRow - this.pageHeight < 0) {
      return this.moveToFirstLine();
    }
    const relativeRow = this.relativeRow;
    this.initialRow -= this.pageHeight;
    this.row = this.initialRow + relativeRow;
    this.readLines();
  }

  displayDetails() {
    const details = new LogDetails({ screen: this.screen });
    details.display(this.rows[this.relativeRow]);
  }

  get relativeRow() {
    return this.row - this.initialRow;
  }

  get lastVisibleLine() {
    return this.initialRow + this.pageHeight;
  }

  update(notify=true) {
    this.setLabel(`[{bold} ${this.file} {/}]`);

    const columns = [
      { title: 'Timestamp', key: 'timestamp' },
      { title: 'Level', key: 'level', format: v => levelColors[v](v) },
      { title: 'D', key: 'data', length: 1, format: v => _.isEmpty(v) ? ' ' : '*' },
      { title: 'Message', key: 'message' },
    ];

    const highlight = (row, index) => {
      const str = row.split('\n')[0];
      if (index === this.relativeRow) {
        return `{white-bg}{black-fg}${str}{/}`;
      }
      return str;
    };

    const rows = JSON.parse(`[${this.lines.join(',')}]`);
    const content = formatRows(rows, columns, this.colSpacing, this.pageWidth-1)
      .map(highlight).join('\n');
    const list = blessed.element({ tags: true, content });
    this.append(list);
    this.screen.render();
    if (notify) {
      this.setUpdated();
    }
  }
}

module.exports = MainPanel;
