const _ = require('lodash');

const { parseFixture } = require('./support/fixtures');
const { Browser } = require('../src/browser');

describe('formatData', () => {
  let tableData, tableDef;

  before(() => {
    const noop = _ => _;
    const contents = parseFixture('workflow-engine.log.2017-09-25');
    const screen = { append: noop };
    const blessed = { parseTags: s => s };
    const contrib = {
      table: def => {
        tableDef = def;
        return {
          setData: data => tableData = data,
          focus: noop,
        };
      },
    };
    new Browser(screen, contents, blessed, contrib);
  });

  describe('headers', () => {
    it('is set', () => {
      expect(tableData.headers).to.eql(['Timestamp', 'Level', 'Message']);
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
    let data;

    beforeEach(() => {
      data = _.last(tableData.data);
    });

    it('has only 3 columns', () => {
      expect(data.length).to.eql(3);
    });

    it('extracts timestamp', () => {
      expect(data[0]).to.eql('2017-09-25T22:48:38.035Z');
    });

    it('extracts level', () => {
      expect(data[1]).to.eql('{cyan-fg}debug{/cyan-fg}');
    });

    it('extracts message', () => {
      expect(data[2]).to.eql('Updated instance \'hemo\' with attributes');
    });
  });
});
