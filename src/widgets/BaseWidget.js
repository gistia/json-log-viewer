const blessed = require('blessed');

class BaseWidget extends blessed.Box {
  constructor(opts) {
    super(Object.assign({}, {
      top: 'center',
      left: 'center',
      width: '100%',
      height: '100%',
      tags: true,
      border: { type: 'line' },
      interactive: true,
      padding: { left: 1, right: 1 },
    }, opts));

    if (opts.handleKeys) {
      this.on('keypress', this.handleKeyPress.bind(this));
    }

    this.screen = opts.screen || opts.parent.screen;
    this.screen.append(this);
  }

  log(...s) {
    this.screen.log(...s);
  }

  setCurrent() {
    this.focus();
    this.screen.render();
    return this;
  }
}

module.exports = BaseWidget;
