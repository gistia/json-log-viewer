const blessed = require('blessed');
const _ = require('lodash');

const BaseWidget = require('./BaseWidget');

class Picker extends BaseWidget {
  constructor(parent=null, opts={}) {
    super(Object.assign({}, opts, {
      parent,
      top: 'center',
      left: 'center',
      width: 'shrink',
      height: 'shrink',
      shadow: true,
      padding: 1,
      style: {
        border: {
          fg: 'red',
        },
        header: {
          fg: 'blue',
          bold: true,
        },
        cell: {
          fg: 'magenta',
          selected: {
            bg: 'blue',
          },
        },
      },
    }));
    this.items = opts.items;
    this.label = opts.label || 'Select item';
    this.keySelect = !!opts.keySelect;
    this.update();
  }

  update() {
    this.setLabel(`{bold} ${this.label} {/}`);
    this.list = blessed.list({
      interactive: true,
      keys: true,
      style: {
        selected: {
          bg: 'white',
          fg: 'black',
          bold: true,
        },
      },
    });
    this.list.on('focus', () => this.log('focus'));
    this.list.on('blur', () => this.log('blur'));
    this.list.on('keypress', this.handleKeyPressed.bind(this));
    this.list.on('select', this.handleSelected.bind(this));
    this.list.setItems(this.items);
    this.append(this.list);
  }

  handleSelected(err, value) {
    this.selected(this.items[value]);
  }

  selected(value) {
    this.list.detach();
    this.detach();
    this.screen.render();
    this.emit('select', null, value);
  }

  handleKeyPressed(ch, _key) {
    if (this.keySelect && /[a-z]/.test(ch)) {
      const item = this.items.find(i => i.startsWith(ch));
      if (item) {
        this.log('item', item);
        this.selected(item);
      }
    }
  }

  setCurrent() {
    this.list.focus();
    this.screen.render();
    return this;
  }
}

module.exports = Picker;
