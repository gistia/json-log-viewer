const EventEmitter = require('events');
const _ = require('lodash');

const { readChunk, countLines } = require('./file');
const BUFFER_SIZE = 5000; // lines
const FIELDS = ['timestamp', 'level', 'message'];

class FileBuffer extends EventEmitter {
  // eslint-disable-next-line no-console
  constructor(file, { firstLine=0, bufferSize=BUFFER_SIZE, _readChunk=readChunk, log=console.log }={}) {
    super();
    this.file = file;
    this.firstBufferLine = firstLine;
    this.bufferSize = bufferSize;
    this.readChunk = _readChunk;
    this.log = log;
  }

  get lastBufferLine() {
    return this.firstBufferLine + (this.lines && this.lines.length || 0);
  }

  getLine(n) {
    return this.lines[n - this.firstBufferLine];
  }

  get(line, count, filters, callback) {
    this.log('get - filters', filters);
    this.log('get - this.filters', this.filters);

    if (this.filters !== filters) {
      // resets buffer when filter changes
      this.log('* filter changed');
      this.filters = filters;
      this.lines = undefined;
    }

    if (this.lines === undefined) {
      this.log('* lines are empty');
      if (this.lastFileLine) {
        return this.loadBuffer(line, count, filters, callback);
      }
      return this.countLines(total => {
        this.lastFileLine = total;
        this.loadBuffer(line, count, filters, callback);
      });
    }

    if (this.lines.length > 0) {
      if (line + count > this.lastFileLine) {
        this.log('after end of file');
        count = this.lastFileLine - line;
      }

      if (line < this.firstBufferLine) {
        this.log('before buffer');
        return this.loadBuffer(line, count, filters, callback);
      }

      if ((line + count) > this.lastBufferLine) {
        this.log('after buffer');
        return this.loadBuffer(line, count, filters, callback);
      }
    }

    const start = line - this.firstBufferLine;
    this.emit('load end');
    callback(this.lines.slice(start, start + count));
  }

  countLines(callback) {
    countLines(this.file, callback);
  }

  loadBuffer(line, count, filters, callback) {
    this.emit('load start');
    const start = Math.max(0, line - this.bufferSize / 2);
    const length = this.bufferSize;

    this.log('FileBuffer - filters', filters);

    const filter = row => {
      const line = JSON.parse(row);
      return filters.reduce((bool, filter) => {
        const key = FIELDS.indexOf(filter.key) > -1
          ? filter.key : `data.${filter.key}`;
        const value = _.get(line, key);
        if (!value) { return false; }
        if (!filter.method) {
          return value && value === filter.value;
        }
        if (filter.method === 'contains') {
          return value && value.toString().toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
        }
      }, true);
    };

    const opts = { filter, file: this.file, start, length };
    return this.readChunk(opts, lines => {
      this.firstBufferLine = start;
      this.lines = lines;
      this.get(line, count, filters, callback);
    });
  }
}

module.exports = FileBuffer;
