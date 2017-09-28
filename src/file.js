const fs = require('fs');
const readline = require('readline');

const readChunk = ({ file, start, length, filter, log }, callback) => {
  const input = fs.createReadStream(file);
  const lineReader = readline.createInterface({ input });

  let curLine = 0;
  const buffer = [];

  lineReader.on('line', (line) => {
    curLine += 1;
    if (curLine < start+1) {
      return;
    }
    if (buffer.length >= length) {
      input.destroy();
      lineReader.close();
    } else {
      const lineMatch = filter ? filter(line) : true;
      if (lineMatch) {
        buffer.push(line);
      }
    }
  });

  lineReader.on('close', () => callback(buffer));
};

const countLines = (file, callback) => {
  let count = 0;
  fs.createReadStream(file)
    .on('data', chunk => {
      for (let i = 0; i < chunk.length; ++i) {
        if (chunk[i] === 10) count++;
      }
    })
    .on('end', () => callback(count));
};

module.exports = { readChunk, countLines };
