import fs from 'fs';
import _ from 'lodash';

export function readLog(file, reader=fs) {
  const contents = reader.readFileSync(file).toString();
  const lines = contents.split('\n').filter(line => line).map(line => JSON.parse(line));

  return lines.map(line => {
    const result = _.pick(line, ['timestamp', 'level', 'message']);
    const data = _.omit(line, ['timestamp', 'level', 'message']);
    return Object.assign({}, result, { data });
  });
};
