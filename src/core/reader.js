const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');

class Reader {
  constructor(fileName) {
    this.fileName = fileName;
    this.filters = [];
  }

  parse(line) {
    return JSON.parse(line);
  }

  addFilter(filter) {
    this.filters.push(filter);
  }

  matchFilters(line) {
    return !this.filters.find(filter => {
      return !filter.apply(line);
    });
  }

  getLines(start, size) {
    const lines = [];
    const stream = fs.createReadStream(this.fileName);

    let currentLine = 1;
    let pending = true;

    return new Promise((resolve, reject) => {
      stream
        .pipe(es.split())
        .pipe(
          es.mapSync(line => {
            const parsedLine = this.parse(line);

            if (this.matchFilters(parsedLine)) {
              if (currentLine++ >= start) {
                lines.push(parsedLine);
              }
            }

            if (pending && lines.length >= size) {
              pending = false;
              stream.pause();
              resolve(_.cloneDeep(lines));
            }
          })
        )
        .on('error', err => {
          reject(err);
        })
        .on('end', () => {
          resolve(lines);
        });
    });
  }
}

module.exports = Reader;
