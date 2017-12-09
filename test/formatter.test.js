const Formatter = require('../src/core/formatter');

describe('Formatter', () => {
  const formatter = new Formatter(100);

  describe('format', () => {
    const format = (line, selected) => formatter.format(line, selected);

    it('pads the line', () => {
      const line = { message: 'Hello world', level: 'info', timestamp: '2017-09-25T22:48:46.651Z' };
      expect(format(line).length).to.eql(137);
    });

    it('formats the line', () => {
      const line = { message: 'Hello world', level: 'info', timestamp: '2017-09-25T22:48:46.651Z' };
      expect(format(line)).to.eql('2017-09-25T22:48:46.651Z  {#ffff94-fg}{bold}info {/bold}{/#ffff94-fg}     Hello world                                                    ');
    });

    it('formats a selected line', () => {
      const line = { message: 'Hello world', level: 'info', timestamp: '2017-09-25T22:48:46.651Z' };
      expect(format(line, true)).to.eql('{white-bg}{black-fg}2017-09-25T22:48:46.651Z  {#ffff94-fg}{bold}info {/bold}{/#ffff94-fg}     Hello world                                                    {/}');
    });

    it('formats the line with data', () => {
      const line = { message: 'Hello world', level: 'info', timestamp: '2017-09-25T22:48:46.651Z', other: '1' };
      expect(format(line)).to.eql('2017-09-25T22:48:46.651Z  {#ffff94-fg}{bold}info {/bold}{/#ffff94-fg}  *  Hello world                                                    ');
    });

    it('exclude new lines', () => {
      const line = { message: 'Hello\nworld', level: 'info', timestamp: '2017-09-25T22:48:46.651Z', other: '1' };
      expect(format(line)).to.eql('2017-09-25T22:48:46.651Z  {#ffff94-fg}{bold}info {/bold}{/#ffff94-fg}  *  Hello                                                          ');
    });
  });

  describe('insertAt', () => {
    it('inserts at given location', () => {
      expect(formatter.insertAt('Felipe', 2, '!')).to.eql('Fe!lipe');
    });
  });

  describe('insertMany', () => {
    it('inserts at multiple locations', () => {
      expect(formatter.insertMany('Some text here', [
        [0, '!'],
        [5, '!!'],
        [10, '!!!'],
      ])).to.eql('!Some !!text !!!here');
    });
  });
});
