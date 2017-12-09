const blessed = require('blessed');

const BaseWidget = require('./BaseWidget');
const Picker = require('./Picker');
const Reader = require('../core/reader');
const Formatter = require('../core/formatter');
const Filter = require('../core/filters');

class MainPanel extends BaseWidget {
  constructor(opts={}) {
    super(Object.assign({}, { top: '0', height: '99%', handleKeys: true }, opts));
    this.log('ready');
    this.formatter = new Formatter(this.pageWidth);
  }

  get pageHeight() { return this.height - 3; };
  get pageWidth() { return this.width - 2 - 2; };
  get lastLine() { return this.initialLine + this.pageHeight; };
  get realLine() { return this.initialLine + this.currentLine - 1; };
  get lastRelativeLine() { return this.pageHeight + 1; };

  loadFile(file) {
    this.file = file;
    this.reader = new Reader(file);
    this.currentLine = 1;
    this.initialLine = 1;
    this.renderLines();
  }

  format(line, idx) {
    return this.formatter.format(line, idx+1 === this.currentLine);
  }

  renderLines() {
    this.reader.getLines(this.initialLine, this.pageHeight+1).then(lines => {
      const content = lines.map(this.format.bind(this)).join('\n');
      const list = blessed.element({ tags: true, content });
      this.append(list);
      this.screen.render();
    }).catch(error => this.log(error));
  }

  handleKeyPress(ch, key) {
    const shortcut = shortcuts[key.name] || shortcuts[ch];
    if (!shortcut) { return; }

    const needsRedraw = this[shortcut].bind(this)();
    if (needsRedraw) {
      this.currentLine = Math.max(this.currentLine, 1);
      this.initialLine = Math.max(this.initialLine, 1);
      this.renderLines();
    }
  }

  moveDown() {
    if (this.realLine + 1 > this.lastLine) {
      this.initialLine++;
    } else {
      this.currentLine++;
    }
    return true;
  }

  moveUp() {
    if (this.realLine - 1 < this.initialLine) {
      this.initialLine--;
    } else {
      this.currentLine -= 1;
    }
    return true;
  }

  pageDown() {
    this.initialLine = this.initialLine + this.pageHeight;
    return true;
  }

  pageUp() {
    this.initialLine = this.initialLine - this.pageHeight;
    return true;
  }

  firstPage() {
    this.initialLine = 1;
    return true;
  }

  firstViewLine() {
    this.currentLine = 1;
    return true;
  }

  lastViewLine() {
    this.currentLine = this.lastRelativeLine;
    return true;
  }

  middleViewLine() {
    this.currentLine = parseInt(this.lastRelativeLine / 2, 10);
    global.screen.log('currentLine', this.currentLine);
    return true;
  }

  openSearchDialog(clear=false) {
    this.prompt('Search:', this.lastSearchTerm, s => this.search(s));
  }

  openGoToLineDialog() {
    this.prompt('Line:', '', v => this.goToLine(v));
  }

  goToLine(v) {
    const line = parseInt(v, 10);
    if (isNaN(line) || line < 1) {
      return this.message(`Error: ${v} is not a valid line`);
    }

    this.initialLine = line;
    this.currentLine = 1;
    this.renderLines();
  }

  toggleSearch() {
    if (this.reader.isFiltered()) {
      return this.clearFilters();
    }
    this.openFilterDialog();
  }

  openFilterDialog() {
    const fields = ['timestamp', 'level', 'message', 'other'];
    this.picker('Filter by', fields, (err, field) => {
      if (err) { return this.message(err); }
      if (!field) { return; }

      if (field === 'level') {
        this.openLevelFilterDialog();
      } else if (field === 'other') {
        this.openCustomFilter();
      } else {
        this.openFilterTerm(field);
      }
    });
  }

  openLevelFilterDialog() {
    const levels = ['all', 'debug', 'info', 'warn', 'error'];
    this.picker('Log Level', levels, (err, level) => {
      if (!level) { return; }
      if (err) { return; }

      this.log('selected', level);
      if (level === 'all') {
        return this.clearFilters();
      }
      this.setLevelFilter(level);
    });
  }

  setLevelFilter(level) {
    this.reader.addFilter(new Filter('level', level));
    this.renderLines();
  }

  clearFilters() {
    this.reader.clearFilters();
    this.renderLines();
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

  picker(label, items, callback) {
    const picker = new Picker(this, { label, items, keySelect: true });
    picker.on('select', (err, value) => callback(null, value));
    picker.setCurrent();
  }

  quit() {
    process.exit(0);
  }
}

const shortcuts = {
  // cursor movement
  down: 'moveDown',
  up: 'moveUp',
  pagedown: 'pageDown',
  pageup: 'pageUp',
  0: 'firstPage',
  A: 'firstViewLine',
  G: 'lastViewLine',
  C: 'middleViewLine',

  // editor operations
  '/': 'openSearchDialog',
  g: 'openGoToLineDialog',
  f: 'toggleSearch',

  // editor commands
  q: 'quit',
};

module.exports = MainPanel;
