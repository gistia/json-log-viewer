const BUFFER_SIZE = 100; // lines

const { readChunk, countLines } = require('./file');

class FileBuffer {
  constructor(file, { firstLine=0, bufferSize=BUFFER_SIZE, _readChunk=readChunk, log=console.log }={}) {
    this.file = file;
    this.firstBufferLine = firstLine;
    this.bufferSize = bufferSize;
    this.readChunk = _readChunk;
    this.log = log;
  }

  get lastBufferLine() {
    return this.firstBufferLine + this.lines.length || 0;
  }

  get(line, count, callback) {
    if (!this.lines) {
      this.log('initial load');
      return this.countLines(total => {
        this.lastFileLine = total;
        this.loadBuffer(line, count, callback);
      });
    }

    if (line + count > this.lastFileLine) {
      this.log('after end of file');
      count = this.lastFileLine - line;
    }

    // this.log('line', line);
    // this.log('this.firstBufferLine', this.firstBufferLine);
    // this.log('this.lastBufferLine', this.lastBufferLine);

    if (line < this.firstBufferLine) {
      this.log('before buffer');
      return this.loadBuffer(line, count, callback);
    }

    // this.log('(line + count)', (line + count));

    if ((line + count) > this.lastBufferLine) {
      this.log('after buffer');
      return this.loadBuffer(line, count, callback);
    }

    const start = line - this.firstBufferLine;
    callback(this.lines.slice(start, start + count));
  }

  countLines(callback) {
    countLines(this.file, callback);
  }

  loadBuffer(line, count, callback) {
    const start = Math.max(0, line - this.bufferSize / 2);
    const length = this.bufferSize;

    this.log('start', start);

    return this.readChunk({ file: this.file, start, length }, lines => {
      this.firstBufferLine = start;
      this.lines = lines;
      this.get(line, count, callback);
    });
  }
}

module.exports = FileBuffer;
