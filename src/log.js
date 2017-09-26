const fs = require('fs');
const _ = require('lodash');

function parse(line) {
  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}

function readLog(file, reader=fs) {
  const contents = reader.readFileSync(file).toString();
  const lines = _.compact(contents.split('\n').filter(line => line).map(parse));

  return lines.map(line => {
    const result = _.pick(line, ['timestamp', 'level', 'message']);
    const data = _.omit(line, ['timestamp', 'level', 'message']);
    return Object.assign({}, result, { data });
  });
};

module.exports = { readLog };
