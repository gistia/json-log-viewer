const _ = require('lodash');

const levelColors = {
  debug: s => `{cyan-fg}${s}{/cyan-fg}`,
  info: s => `{#ffff94-fg}{bold}${s}{/bold}{/#ffff94-fg}`,
  warn: s => `{orange-fg}${s}{/orange-fg}`,
  error: s => `{red-fg}${s}{/red-fg}`,
};


class Browser {
  constructor(screen, rawData, _blessed=require('blessed'), _contrib=require('blessed-contrib')) {
    this.blessed = _blessed;
    this.contrib = _contrib;

    const def = this.parseData(rawData);

    const table = this.contrib.table({
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
    table.focus();

    screen.append(table);
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

module.exports = { Browser };
