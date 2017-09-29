const BUFFER_SIZE = 10000; // lines

const { readChunk } = require('./file');

class FileBuffer {
  constructor(file, { firstLine=0, bufferSize=BUFFER_SIZE, _readChunk=readChunk }) {
    this.file = file;
    this.firstLine = firstLine;
    this.readChunk = _readChunk;
    this.bufferSize = bufferSize;
  }

  get lastLine() {
    return this.firstLine + this.bufferSize;
  }

  read(callback) {
    this.readChunk({
      file: this.file,
      start: this.firstLine,
      length: this.bufferSize,
    }, lines => {
      this.lines = lines;
      callback(lines);
    });
  }

  get bufferRange() {
    return [this.firstLine, this.lastLine];
  }

  isInCache(n, length) {
    return FileBuffer.withinRange(this.bufferRange, [n, n + length]);
  }

  readLines(n, length, callback) {
    this.firstLine = n;
    this.readChunk({
      file: this.file,
      start: this.firstLine,
      length: this.bufferSize,
    }, lines => {
      this.lines = lines;
      callback(lines.slice(0, length));
    });
  }

  redoLines(n, length, callback) {
    this.readChunk({
      file: this.file,
      start: n,
      length: this.bufferSize / 2,
    }, lines => {
      const newLines = this.lines.concat(lines);
      const pos = newLines.length - this.bufferSize;
      this.lines = newLines.slice(pos);
      callback(lines.slice(0, length));
    });
  }

  getLines(n, length, callback) {
    if (this.isInCache(n, length)) {
      return this.lines.slice(n, n+length);
    }

    const missingLines = FileBuffer.missingLines(this.bufferRange, [n, n + length]);
    if (missingLines) {
      this.redoLines(n, length, callback);
    } else {
      this.readLines(n, length, callback);
    }
  }
}

FileBuffer.withinRange = (range, compare) => {
  return compare[0] >= range[0] && compare[1] <= range[1];
};

FileBuffer.rangePosition = (r1, r2) => {
  if (r2[1] > r1[1] && r2[0] <= r1[1]) {
    return 1;
  }
  if (r2[0] < r1[0] && r2[1] >= r1[0]) {
    return -1;
  }
};

FileBuffer.missingLines = (range, required) => {
  const position = FileBuffer.rangePosition(range, required);
  if (position === -1) {
    return [required[0], range[0]-1];
  }
  if (position === 1) {
    return [range[1]+1, required[1]];
  }
};

module.exports = FileBuffer;
