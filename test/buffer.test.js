const FileBuffer = require('../src/buffer.js');

describe('FileBuffer', () => {
  const buffer = new FileBuffer('test/fixtures/sample.log', {
    bufferSize: 20,
  });

  describe('get', () => {
    let lines;

    beforeEach(done => {
      buffer.get(0, 10, _lines => done());
    });

    const loadLines = (line, count) => {
      beforeEach(done => {
        buffer.get(line, count, _lines => {
          lines = _lines;
          done();
        });
      });
    };

    describe('when the whole section is in the buffer', () => {
      loadLines(0, 10);

      it('return the lines', () => {
        expect(lines.length).to.eql(10);
      });

      it('fills the buffer with 20 lines', () => {
        expect(buffer.lines.length).to.eql(20);
      });
    });

    describe('when the section is after the buffer', () => {
      loadLines(5, 10);

      it('return the lines', () => {
        expect(buffer.lines.length).to.eql(20);
      });
    });

    describe('reading towards the end', () => {
      loadLines(495, 10);

      it('return the lines', () => {
        expect(lines.length).to.eql(5);
      });

      it.skip('fills the buffer with 20 lines', () => {
        expect(buffer.lines.length).to.eql(20);
      });
    });
  });
});

// const { withinRange, missingLines, rangePosition } = FileBuffer;

// describe('rangePosition', () => {
//   const range = [10, 20];

//   it(`returns -1 if it's before`, () => {
//     expect(rangePosition(range, [0, 11])).to.eql(-1);
//     expect(rangePosition(range, [9, 10])).to.eql(-1);
//   });

//   it(`returns 1 if it's after`, () => {
//     expect(rangePosition(range, [10, 22])).to.eql(1);
//     expect(rangePosition(range, [12, 25])).to.eql(1);
//   });

//   it(`returns null if it doesn't intersect`, () => {
//     expect(rangePosition(range, [0, 9])).to.be.undefined;
//     expect(rangePosition(range, [21, 29])).to.be.undefined;
//   });
// });

// describe('withinRange', () => {
//   const range = [10, 20];

//   it('returns true if exact range', () => {
//     expect(withinRange(range, [10, 20])).to.be.true;
//   });

//   it('returns true if within range', () => {
//     expect(withinRange(range, [10, 11])).to.be.true;
//   });

//   it('returns true if inside range', () => {
//     expect(withinRange(range, [11, 20])).to.be.true;
//   });

//   it('returns false if outside upper boundary', () => {
//     expect(withinRange(range, [9, 11])).to.be.false;
//     expect(withinRange(range, [9, 19])).to.be.false;
//   });

//   it('returns false if outside bottom boundary', () => {
//     expect(withinRange(range, [19, 21])).to.be.false;
//     expect(withinRange(range, [11, 21])).to.be.false;
//   });

//   it('returns false if outside range', () => {
//     expect(withinRange(range, [0, 9])).to.be.false;
//     expect(withinRange(range, [30, 31])).to.be.false;
//   });
// });

// describe('missingLines', () => {
//   const range = [10, 20];

//   it('returns missing lines after range', () => {
//     expect(missingLines(range, [12, 25])).to.eql([21, 25]);
//   });

//   it('returns missing lines before range', () => {
//     expect(missingLines(range, [0, 11])).to.eql([0, 9]);
//   });

//   it('returns null if needs all lines', () => {
//     expect(missingLines(range, [0, 5])).to.be.undefined;
//   });
// });

// describe.only('FileBuffer', () => {
//   const buffer = new FileBuffer('test/fixtures/sample.log', {
//     bufferSize: 20,
//   });
//   let lines;

//   beforeEach((done) => {
//     buffer.read(_lines => {
//       lines = _lines;
//       done();
//     });
//   });

//   it('reads the number of lines of the buffer', () => {
//     expect(lines.length).to.eql(20);
//     expect(lines[0]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message1","timestamp":"2017-09-25T22:48:46.651Z"}');
//     expect(lines[19]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message20","timestamp":"2017-09-25T22:48:46.651Z"}');
//   });

//   describe('getLines', () => {
//     describe('when in cache', () => {
//       let lines;
//       beforeEach(() => { lines = buffer.getLines(1, 5); });

//       it('returns the chunk', () => {
//         expect(lines.length).to.eql(5);
//       });

//       it('returns the proper lines', () => {
//         expect(lines[0]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message2","timestamp":"2017-09-25T22:48:46.651Z"}');
//         expect(lines[1]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message3","timestamp":"2017-09-25T22:48:46.651Z"}');
//       });

//       it('keeps the cache', () => {

//       });
//     });

//     describe('when partially outside of the cache', () => {
//       let lines;

//       beforeEach((done) => {
//         buffer.getLines(16, 5, _lines => {
//           lines = _lines;
//           done();
//         });
//       });

//       it('returns the chunk', () => {
//         expect(lines.length).to.eql(5);
//       });

//       it('returns the proper lines', () => {
//         expect(lines[0]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message17","timestamp":"2017-09-25T22:48:46.651Z"}');
//         expect(lines[4]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message21","timestamp":"2017-09-25T22:48:46.651Z"}');
//       });

//       it('adds 50% of the buffer and trim it', () => {
//         expect(buffer.lines.length).to.eql(20);
//         expect(buffer.lines[0]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message11","timestamp":"2017-09-25T22:48:46.651Z"}');
//         expect(buffer.lines[19]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message26","timestamp":"2017-09-25T22:48:46.651Z"}');
//       });
//     });

//     describe('when completely outside of the cache', () => {
//       let lines;

//       before((done) => {
//         buffer.getLines(30, 5, _lines => {
//           lines = _lines;
//           done();
//         });
//       });

//       it('returns the chunk', () => {
//         expect(lines.length).to.eql(5);
//       });

//       it('returns the proper lines', () => {
//         expect(lines[0]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message31","timestamp":"2017-09-25T22:48:46.651Z"}');
//         expect(lines[4]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message35","timestamp":"2017-09-25T22:48:46.651Z"}');
//       });

//       it('stores a new internal cache', () => {
//         expect(buffer.lines.length).to.eql(20);
//         expect(buffer.lines[0]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message31","timestamp":"2017-09-25T22:48:46.651Z"}');
//         expect(buffer.lines[19]).to.eql('{"res":{"statusCode":200},"level":"info","message":"message50","timestamp":"2017-09-25T22:48:46.651Z"}');
//       });
//     });
//   });
// });
