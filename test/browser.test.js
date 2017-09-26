const { parseFixture } = require('./support/fixtures');
const { parseData } = require('../src/browser');

describe('formatData', () => {
  let tableDef, data;

  before(() => {
    const contents = parseFixture('workflow-engine.log.2017-09-25');
    tableDef = parseData(contents);
    data = tableDef.data;
  });

  describe('headers', () => {
    it('is set', () => {
      expect(tableDef.headers).to.eql(['Timestamp', 'Level', 'Message']);
    });
  });

  describe('columnWidth', () => {
    it('sets to the maximum width', () => {
      const { columnWidth } = tableDef;
      expect(columnWidth[0]).to.eql(24);
      expect(columnWidth[1]).to.eql(5);
      expect(columnWidth[2]).to.eql(5325);
    });
  });

  describe('data', () => {
    it('has only 3 columns', () => {
      expect(data[0].length).to.eql(3);
    });

    it('extracts timestamp', () => {
      expect(data[0][0]).to.eql('2017-09-25T22:48:38.035Z');
    });

    it('extracts level', () => {
      expect(data[0][1]).to.eql('{cyan-fg}debug{/cyan-fg}');
    });

    it('extracts message', () => {
      expect(data[0][2]).to.eql('Updated instance \'hemo\' with attributes');
    });
  });

  describe('rawData', () => {
    it('keeps object', () => {
      expect(tableDef.rawData[0].data.to.currentState).to.eql('resultPending');
    });
  });
});
