class Buffer {
  constructor(size, source) {
    this.buffer = [];
    this.size = size;
    this.source = source;
  }

  loadFromSource(start, count) {
    return this.source.getLines(start, count).then(lines => {
      this.firstLine = start;
      this.lastLine = start + lines.length;
      this.lines = lines;
      return lines;
    });
  }

  getLines(start, count) {
    const adjStart = Math.max(1, Math.min(start, start-(this.size/2)));
    const adjCount = Math.max(count+(this.size/2), this.size);
    const firstLine = start;
    const lastLine = start + count;

    // no lines on the buffer
    //  fetch all lines + extra

    if (!this.firstLine) {
      global.log('first load');
      return this.loadFromSource(adjStart, adjCount).then(lines => {
        const firstPos = this.firstLine - start;
        const lastPos = this.firstLine + count;

        return lines.slice(firstPos, lastPos);
      });
    } else {
      // check if we have all the lines on the buffer
      //   return lines
      if ((this.firstLine <= firstLine) && (lastLine <= this.lastLine)) {
        global.log('everything in buffer');
        const firstPos = firstLine - this.firstLine;
        const lastPos = lastLine - this.firstLine;
        return Promise.resolve(this.lines.slice(firstPos, lastPos));
      } else if (this.firstLine <= firstLine) {
        // the beginning of the buffer is loaded
        global.log('top in buffer');
        const firstPos = firstLine - this.firstLine;
        const partialLines = this.lines.slice(firstPos);
        const newStart = firstPos + partialLines.length;
        const newCount = this.size;
        return this.loadFromSource(newStart, newCount).then(lines => {
          const result = partialLines.concat(lines).slice(0, count);
          return Promise.resolve(result);
        });
      } else if (lastLine <= this.lastLine) {
        global.log('bottom in buffer');
        global.log('lastLine', lastLine);
        global.log('this.lastLine', this.lastLine);
        const lastPos = lastLine - this.firstLine;
        const partialLines = this.lines.slice(0, lastPos);
        const newCount = this.size;
        return this.loadFromSource(adjStart, newCount).then(lines => {
          const result = lines.concat(partialLines).slice(start - adjStart, start - adjStart + count);
          return Promise.resolve(result);
        });
      }
    }

    // check if we have partial lines on the buffer
    //  fetch partial missing lines + extra
  }
}

module.exports = Buffer;
