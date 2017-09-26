const _ = require('lodash');

const { parseFixture } = require('./support/fixtures');
const { Browser, formatEntry } = require('../src/browser');

describe('formatData', () => {
  let tableData, tableDef;

  before(() => {
    const noop = _ => _;
    const contents = parseFixture('workflow-engine.log.2017-09-25');
    const screen = { append: noop };
    const blessed = { parseTags: s => s };
    const table = def => {
      tableDef = def;
      return {
        setData: data => tableData = data,
        focus: noop,
      };
    };
    new Browser(screen, contents, blessed, table);
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

describe.only('formatEntry', () => {
  it('formats simple values', () => {
    expect(formatEntry('Name', 'felipe')).to.eql('{blue-fg}{bold}Name:{/bold}{/blue-fg} felipe');
  });

  it('formats objects', () => {
    const expected = `{blue-fg}{bold}Data:{/bold}{/blue-fg}
  {blue-fg}{bold}name:{/bold}{/blue-fg} felipe
  {blue-fg}{bold} age:{/bold}{/blue-fg} 12`;
    expect(formatEntry('Data', { name: 'felipe', age: 12 })).to.eql(expected);
  });
});
