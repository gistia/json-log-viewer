const _ = require('lodash');

const COLOR_TAG_REGEX = /{\/?[\w\-,;!#]*}/g;

const formatRows = (rows, columns, spacing=1) => {
  const lengths = maxLengths(rows);
  return rows.map(row => {
    return columns.map(column => {
      const { format, key } = column;
      const rawValue = row[key];
      const value = _.isFunction(format) ? format(rawValue) : rawValue;

      return padEnd(value, lengths[column.key]);
    }).join(spaces(spacing));
  });
};

const maxLengths = (arr) => {
  return arr.reduce((map, row) => {
    Object.keys(row).forEach(k => {
      map[k] = Math.max(map[k] || 0, len(row[k].toString()));
    });
    return map;
  }, {});
};

const hasColors = (text) => {
  return text.match(COLOR_TAG_REGEX);
};

const stripColors = (text) => {
  return (text || '').replace(COLOR_TAG_REGEX, '');
};

const len = (text) => {
  return stripColors(text).length;
};

const spaces = (n) => new Array(n+1).join(' ');

const padEnd = (text, length) => {
  const nSpaces = length - len(text);
  if (nSpaces < 0) {
    return trunc(text, length);
  }
  return `${text}${spaces(nSpaces)}`;
};

const trunc = (text, length) => {
  if (!text) { return ''; }
  if (!hasColors(text)) {
    return text.substring(0, length);
  }
  if (len(text) <= length) {
    return text;
  }

  let curLen = 0;
  let isTag = false;
  let output = '';
  let i = 0;
  while (curLen < length) {
    const ch = text.charAt(i);
    output += ch;
    if (ch === '{') {
      isTag = true;
    }
    if (!isTag) {
      curLen += 1;
    }
    if (ch === '}') {
      isTag = false;
    }
    i += 1;
  }

  return `${output}{/}`;
};

const levelColors = {
  debug: s => `{cyan-fg}${s}{/cyan-fg}`,
  info: s => `{#ffff94-fg}{bold}${s}{/bold}{/#ffff94-fg}`,
  warn: s => `{orange-fg}${s}{/orange-fg}`,
  error: s => `{red-fg}${s}{/red-fg}`,
};

module.exports = { formatRows, maxLengths, hasColors, stripColors, spaces, padEnd, len, trunc, levelColors };
