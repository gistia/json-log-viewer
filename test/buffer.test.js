const Buffer = require('../src/core/buffer');

class Source {
  getLines(start, count) {
    const array = [...Array(count)];
    const result = array.map((_, i) => {
      return `line ${start+i}`;
    });
    return Promise.resolve(result);
  }
}

describe.only('Buffer', () => {
  describe.only('when at the beginning of a file', () => {
    it('returns the initial lines + a buffer', () => {
      const buffer = new Buffer(100, new Source());
      return buffer.getLines(100, 10).then(lines => {
        // console.log('lines', lines);
        expect(lines.length).to.eql(10);
        expect(lines[0]).to.eql('line 100');
        expect(lines[9]).to.eql('line 109');
        return buffer.getLines(45, 10).then(_lines => {
          console.log('_lines.length', _lines.length);
          console.log('_lines', _lines);
        });
      });
    });
  });

  describe('after the beginning of a file', () => {
    it('prepends and appends the buffer', () => {
      const buffer = new Buffer(100, new Source());
      return buffer.getLines(2000, 20).then(lines => {
        expect(lines.length).to.eql(20);
        expect(lines[0]).to.eql('line 2000');
        expect(lines[20]).to.eql('line 2020');
        return lines;
      });
    });
  });
});
