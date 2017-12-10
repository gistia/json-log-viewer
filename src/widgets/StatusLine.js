const blessed = require('blessed');
const _ = require('lodash');

const COLOR_TAG_REGEX = /{\/?[\w\-,;!#]+}/g;

class StatusLine extends blessed.Box {
  constructor(opts={}) {
    super(Object.assign({}, {
      top: opts.screen.height-1,
      left: 0,
      width: '100%',
      height: 1,
      tags: true,
      style: {
        fg: 'white',
        bg: '#484848',
      },
    }, opts));

    this.on('resize', () => {
      this.position.top = opts.screen.height-1;
      this.renderStatus();
    });

    this.reader = opts.reader;
    this.count = '...';
    this.mainPanel = opts.mainPanel;
    this.mainPanel.on('renderLines', this.renderStatus.bind(this));
    this.reader.countLines().then(count => {
      this.count = count;
      this.renderStatus();
    });
    this.renderStatus();
  }

  len(str) {
    return this.stripColors(str).length;
  }

  makeLine(left, right) {
    const spaces = this.mainPanel.pageWidth - this.len(left) - this.len(right) + 6;
    return `${left}${new Array(spaces).join(' ')}${right}`;
  }

  formatSize(bytes) {
    if (bytes > 1000000000) {
      return (bytes / 1000000000.0).toPrecision(3) + 'Gb';
    } else if (bytes > 1000000) {
      return (bytes / 1000000.0).toPrecision(3) + 'Mb';
    } else if (bytes > 1000) {
      return (bytes / 1000.0).toPrecision(3) + 'Kb';
    } else {
      return bytes + 'b';
    }
  }

  stripColors(text) {
    return (text || '').replace(COLOR_TAG_REGEX, '').replace(/\{\/}/g, '');
  };

  renderStatus() {
    const [fileName, ...path] = this.reader.fileName.split('/').reverse();
    const file = `{bold}{#dfdfdf-fg}${path.reverse().join('/')}/{/#dfdfdf-fg}${fileName}{/}`;
    const mem = `${this.formatSize(process.memoryUsage().heapUsed)}`;
    const line = `{black-fg}{white-bg}{bold} ${this.mainPanel.realLine}{/bold}{#555-fg} / ${this.count} {/}`;
    this.setContent(this.makeLine(` ${file} `, `${mem} ${line} `));
    this.screen.render();
  }
}

module.exports = StatusLine;
