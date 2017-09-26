import fs from 'fs';
import { readLog } from '../../src/log';

export const loadFixture = (name) => {
  return fs.readFileSync(`./test/fixtures/${name}`).toString();
};

export const parseFixture = (name) => {
  const contents = loadFixture(name);
  const stubFS = { readFileSync: () => contents };
  return readLog('', stubFS);
};
