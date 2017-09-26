import blessed from 'blessed';
import contrib from 'blessed-contrib';
import _ from 'lodash';

export const newBrowser = (rawData) => {
  const def = parseData(rawData);

  const table = contrib.table({
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

  return table;
};

const levelColors = {
  debug: s => `{cyan-fg}${s}{/cyan-fg}`,
  info: s => `{#ffff94-fg}{bold}${s}{/bold}{/#ffff94-fg}`,
  warn: s => `{orange-fg}${s}{/orange-fg}`,
  error: s => `{red-fg}${s}{/red-fg}`,
};

const formatLevel = (level) => blessed.parseTags(levelColors[level](level));

const fixLevels = (data) => data.map(d => [d[0], formatLevel(d[1]), d[2]]);

const formatRow = (row) => {
  return [
    row.timestamp,
    row.level,
    row.message,
  ];
};

export const parseData = (rawData) => {
  const headers = ['Timestamp', 'Level', 'Message'];
  const data = rawData.map(formatRow);
  const columnWidth = data.reduce((arr, value) => {
    return arr.map((v, index) => Math.max(value[index].length, v));
  }, [0, 0, 0]);

  return { columnWidth, headers, data: fixLevels(data), rawData };
};
