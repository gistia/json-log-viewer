const { loadFixture } = require('./support/fixtures');
const { readLog } = require('../src/log');

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
