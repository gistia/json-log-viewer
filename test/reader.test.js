const Reader = require('./reader');
const ContainsFilter = require('./contains');

describe.only('Reader', () => {
  describe('getLines', () => {
    it('returns the lines of a file', () => {
      const reader = new Reader('test/fixtures/workflow-engine.log.2017-09-25');
      return reader.getLines(1, 10).then(lines => {
        expect(lines.length).to.eql(10);
        expect(lines[0].message).to.eql('Updated instance \'hemo\' with attributes');
      });
    });

    it('starts at a given part of a file', () => {
      const reader = new Reader('test/fixtures/workflow-engine.log.2017-09-25');
      return reader.getLines(20, 2).then(lines => {
        expect(lines.length).to.eql(2);
        expect(lines[0].message).to.eql('59c1288c413d39718369c746 hemo: setProviderAttributes');
        expect(lines[1].message).to.eql('59c1288c413d39718369c746 hemo: setProviderAttributes - providerAttrs');
      });
    });

    it('returns a smaller chunk if file is smaller', () => {
      const reader = new Reader('test/fixtures/sample.log.json');
      return reader.getLines(5, 20).then(lines => {
        expect(lines.length).to.eql(2);
        expect(lines[0].message).to.eql('message5');
        expect(lines[1].message).to.eql('message6');
      });
    });
  });

  describe('filtering', () => {
    it('returns a filtered set', () => {
      const reader = new Reader('test/fixtures/workflow-engine.log.2017-09-25');
      reader.addFilter(new ContainsFilter('message', 'Attr'));
      return reader.getLines(1, 10).then(lines => {
        expect(lines.length).to.eql(10);
        expect(lines[0].message).to.eql('Updated instance \'hemo\' with attributes');
        expect(lines[2].message).to.eql('59c1288c413d39718369c746 hemo: setProviderAttributes');
      });
    });
  });
});
