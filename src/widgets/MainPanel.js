const blessed = require('blessed');
const _ = require('lodash');

const { readLog } = require('../log');
const { formatRows, levelColors } = require('../utils');

const BaseWidget = require('./BaseWidget');
const LogDetails = require('./LogDetails');
const Picker = require('./Picker');

const FIELDS = ['timestamp', 'level', 'message'];

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
    this.lastSearchTerm = null;
    this.levelFilter = opts.level;
    this.filters = [];
    this.sort = opts.sort || '-timestap';

    this.log('pageWidth', this.pageWidth);
    this.update();
  }

  loadFile(file) {
    this.file = file;
    this.rawLines = readLog(file);
    this.log('loaded', this.lines.length);
    this.renderLines();
  }

  get lastRow() {
    return (this.lines || []).length - 1;
  }

  get lines() {
    if (!this.rawLines) {
      return [];
    }

    const sort = (lines) => {
      this.log('sort', this.sort);
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
        if (!filter.method) {
          return value && value === filter.value;
        }
        if (filter.method === 'contains') {
          return value && value.indexOf(filter.value) > -1;
        }
      }, true);
    }));
  }

  renderLines() {
    this.rows = this.lines.slice(this.initialRow, this.initialRow + this.height - 2);
    this.update();
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
    if (ch === '/') {
      this.openSearch();
      return;
    }
    if (ch === '?') {
      this.openSearch(true);
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
      this.openFilter();
      return;
    }
    if (ch === 'r') {
      this.clearFilters();
      return;
    }
  }

  openLevelFilter() {
    const levels = ['all', 'debug', 'info', 'warn', 'error'];
    this.openPicker('Log Level', levels, (err, level) => {
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
    this.openPicker('Sort by', FIELDS, (err, sort) => {
      if (err) { return; }
      if (this.sortKey === sort && this.sortAsc) {
        return this.setSort(`-${sort}`);
      }
      this.setSort(sort);
    });
  }

  openFilter() {
    const fields = ['timestamp', 'level', 'message', 'other'];
    this.openPicker('Filter by', fields, (err, field) => {
      if (err) { return; }
      if (field === 'other') {
        return this.openCustomFilter();
      }
      this.openFilterTerm(field);
    });
  }

  openCustomFilter() {
    this.prompt(`Field to filter:`, '', (field) => {
      this.openFilterTerm(field);
    });
  }

  openFilterTerm(field) {
    this.prompt(`Filter ${field} by:`, '', (value) => {
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
    this.renderLines();
  }

  setFilter(key, value, method) {
    this.filters = [{ key, value, method }];
    this.renderLines();
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
    if (clear) {
      this.lastSearchTerm = null;
    }
    this.prompt('Search:', this.lastSearchTerm, (value) => this.search(value));
  }

  openGoToLine() {
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
    this.renderLines();
  }

  moveUp() {
    this.row = Math.max(0, this.row - 1);
    if (this.row < this.initialRow) {
      this.initialRow = this.row;
    }
    this.renderLines();
  }

  moveDown() {
    this.row = Math.min(this.lastRow, this.row + 1);
    if (this.row > this.lastVisibleLine) {
      this.initialRow += 1;
    }
    this.renderLines();
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
    this.renderLines();
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

  update() {
    this.setLabel(`[{bold} ${this.file} {/}] [{bold} ${this.row+1}/${this.lastRow+1} {/}]`);

    const columns = [
      { title: 'Timestap', key: 'timestamp' },
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

    const content = formatRows(
      this.rows, columns, this.colSpacing, this.pageWidth-1).map(highlight).join('\n');
    const list = blessed.element({ tags: true, content });
    this.append(list);
    this.screen.render();
  }
}

module.exports = MainPanel;
