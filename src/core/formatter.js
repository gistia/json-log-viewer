const _ = require('lodash');

class Formatter {
  constructor(length) {
    this.length = length;
  }

  insertAt(str, pos, insertStr) {
    return [str.slice(0, pos), insertStr, str.slice(pos)].join('');
  }

  insertMany(str, inserts) {
    return _.chain(inserts).sortBy([i => i[0]]).reverse().value().reduce((str, insert) => {
      return this.insertAt(str, insert[0], insert[1]);
    }, str);
  }

  padEnd(text, length) {
    const nSpaces = length - text.length;
    if (nSpaces < 0) {
      return text.substring(0, length);
    }
    return `${text}${new Array(nSpaces+1).join(' ')}`;
  }

  format(line, selected) {
    const data = _.omit(line, ['timestamp', 'level', 'message']);
    const hasData = Object.keys(data).length ? '*' : ' ';
    const level = this.padEnd(line.level, 5);
    const message = line.message.split('\n')[0];
    const rawLine = this.padEnd(`${line.timestamp}  ${level}  ${hasData}  ${message}`, this.length-1);
    const [ open, close ] = levelColors[line.level] || ['', ''];
    const result = (selected ? '{white-bg}{black-fg}' : '') +
      this.insertMany(rawLine, [
        [26, open],
        [31, close],
      ]) +
      (selected ? '{/}' : '');
    return result;
  }
}

const levelColors = {
  debug: ['{cyan-fg}', '{/cyan-fg}'],
  info:  ['{#ffff94-fg}{bold}', '{/bold}{/#ffff94-fg}'],
  warn:  ['{orange-fg}', '{/orange-fg}'],
  error: ['{red-fg}', '{/red-fg}'],
};

module.exports = Formatter;
