const _ = require('lodash');
const blessed = require('blessed');

const levelColors = {
  debug: s => `{cyan-fg}${s}{/cyan-fg}`,
  info: s => `{#ffff94-fg}{bold}${s}{/bold}{/#ffff94-fg}`,
  warn: s => `{orange-fg}${s}{/orange-fg}`,
  error: s => `{red-fg}${s}{/red-fg}`,
};

const fmtKey = (rawKey, padding=undefined) => {
  const key = padding
    ? `${rawKey}:`.padEnd(padding+1)
    : `${rawKey}:`;
  return `{blue-fg}{bold}${key}{/bold}{/blue-fg}`
};
const fmtVal = (val) => ` ${val}`;

const spaces = (s, len) => new Array(len).join(' ') + s;

const formatEntry = (key, val, padding=undefined, level=0) => {
  const value = _.isObject(val)
    ? formatObject(val, level + 1)
    : fmtVal(val);
  return `${fmtKey(key, padding)}${value}`;
}

const formatObject = (obj, level=0) => {
  const padding = Math.max(...Object.keys(obj).map(k => k.length));
  const entries = Object.keys(obj)
    .map(key => `${formatEntry(key, obj[key], padding, level)}`)
    .map(val => spaces(val, level * 2));
  return [''].concat(entries).join('\n');
};

class Browser {
  constructor(screen, rawData, _blessed=require('blessed'), Table=require('./widgets/table')) {
    this.blessed = _blessed;
    this.screen = screen;
    this.rawData = rawData;
    this.jsonMode = false;

    const def = this.parseData(rawData);

    const table = Table({
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: true,
      label: 'Logs',
      width: '100%',
      height: '100%',
      border: { type: 'line', fg: 'cyan' },
      columnSpacing: 3,
      columnWidth: def.columnWidth,
    });

    table.setData({ headers: def.headers, data: def.data });
    table.on('keypress', this.onKeyPressed.bind(this));
    table.focus();

    this.screen.append(table);
    this.table = table;
  }

  onKeyPressed(ch, key) {
    if (key.name === 'enter') {
      this.showDetails();
    }
  }

  get currentEntry() {
    return this.rawData[this.table.rows.selected];
  }

  entryHeader() {
    const { currentEntry } = this;
    const { timestamp, level, message } = currentEntry;
    const fmtLevel = levelColors[level](level);
    return `${timestamp} ${fmtLevel}\n${message}\n`;
  }

  formattedEntry() {
    const { currentEntry } = this;
    const { data } = currentEntry;
    return `${this.entryHeader()}${formatObject(data)}`;
  }

  showDetails() {
    const content = this.formattedEntry();
    const box = blessed.box({
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      content,
      tags: true,
      border: { type: 'line' },
      scrollable: true,
      keys: true,
      alwaysScroll: true,
    });
    box.focus();
    box.on('keypress', (ch, key) => {
      if (key.name === 'escape' || key.name === 'enter') {
        this.table.focus();
        this.screen.remove(box);
        this.screen.render();
        return;
      } else if (key.name === 'j') {
        this.jsonMode = !this.jsonMode;
        const content = this.jsonMode
          ? JSON.stringify(this.currentEntry, null, 2)
          : this.formattedEntry();
        box.setContent(content);
        this.screen.render();
      }
    });

    this.screen.append(box);
    this.screen.render();
  }

  formatLevel(level) {
    return this.blessed.parseTags(levelColors[level](level));
  }

  fixLevels(data) {
    return data.map(d => [d[0], this.formatLevel(d[1]), d[2]]);
  }

  formatRow(row) {
    return [
      row.timestamp,
      row.level,
      row.message,
    ];
  };

  parseData(rawData) {
    const headers = ['Timestamp', 'Level', 'Message'];
    const data = rawData.map(this.formatRow);
    const columnWidth = data.reduce((arr, value) => {
      return arr.map((v, index) => Math.max(value[index].length, v));
    }, [0, 0, 0]);

    return { columnWidth, headers, data: this.fixLevels(data).reverse(), rawData };
  };
}

module.exports = { Browser, formatEntry };
