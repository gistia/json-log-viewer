const { loadFixture } = require('./support/fixtures');
const { readLog, transform } = require('../src/log');

describe('readLog', () => {
  let entries;

  describe('normal log', () => {
    before(() => {
      const contents = loadFixture('workflow-engine.log.2017-09-25');
      const stubFS = { readFileSync: () => contents };
      entries = readLog('', stubFS);
    });

    it('sets timestamp', () => {
      expect(entries[0].timestamp).to.eql('2017-09-25T22:48:38.035Z');
    });

    it('sets level', () => {
      expect(entries[0].level).to.eql('debug');
    });

    it('sets message', () => {
      expect(entries[0].message).to.eql('Updated instance \'hemo\' with attributes');
    });

    it('sets data', () => {
      expect(entries[0].data.to.type).to.eql('workflow-instance');
    });
  });

  describe('log with invalid entries', () => {
    before(() => {
      const contents = loadFixture('broken.log');
      const stubFS = { readFileSync: () => contents };
      entries = readLog('', stubFS);
    });

    it('skips invalid entries', () => {
      expect(entries.length).to.eql(3);
    });
  });
});

describe('transform', () => {
  let exists = false;
  let contents = null;

  const fs = {
    existsSync: () => exists,
    readFileSync: () => contents,
  };

  describe('when config doesn\'t exist', () => {
    it('returns the unmodified line', () => {
      expect(transform('something', fs)).to.eql('something');
    });
  });

  describe('when config exists', () => {
    it('transforms the line', () => {
      exists = true;
      contents = loadFixture('transform1.ini');
      const logEntry = JSON.parse(loadFixture('monolog.log.json'));
      const entry = transform(logEntry, fs);
      expect(entry.timestamp).to.eql('2017-12-06 09:23:42.253060');
      expect(entry.level).to.eql('INFO');
    });
  });
});
