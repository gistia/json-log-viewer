const fs = require('fs');
const { readLog } = require('../../src/log');

const loadFixture = (name) => {
  return fs.readFileSync(`./test/fixtures/${name}`).toString();
};

const parseFixture = (name) => {
  const contents = loadFixture(name);
  const stubFS = { readFileSync: () => contents };
  return readLog('', stubFS);
};

module.exports = { loadFixture, parseFixture };
