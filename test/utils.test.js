const { formatRows, maxLengths, stripColors, spaces, padEnd, len, trunc } = require('../src/utils');

describe('spaces', () => {
  it('return number of spaces', () => {
    expect(spaces(2)).to.eql('  ');
  });
});

describe('stripColors', () => {
  it('strip colors', () => {
    expect(stripColors('{fg-abc}Name{/}')).to.eql('Name');
  });

  it('works with undefined', () => {
    expect(stripColors(undefined)).to.eql('');
  });
});

describe('formatRows', () => {
  it('returns the formatted rows', () => {
    const data = [
      { ts: '2012-01-01 10:01:01.12',  lvl: '{fg-yellow}debug{/fg-yellow}', msg: 'Something happened' },
      { ts: '2012-01-01 10:01:01.123', lvl: 'info',  msg: 'Other thing happened' },
    ];
    const columns = [ { key: 'ts' }, { key: 'lvl' }, { key: 'msg' } ];
    const exp = [
      '2012-01-01 10:01:01.12  {fg-yellow}debug{/fg-yellow} Something happened  ',
      '2012-01-01 10:01:01.123 info  Other thing happened',
    ];
    const str = formatRows(data, columns);

    expect(str).to.eql(exp);
  });
});

describe('maxLengths', () => {
  it('returns the maximum length per item on array', () => {
    const arr = [
      { one: 'a', two: '{fg-yellow}babc{/fg-yellow}' },
      { one: 'aa', three: 'kkk' },
      { two: 'a', three: 'ssss' },
    ];
    expect(maxLengths(arr)).to.eql({ one: 2, two: 4, three: 4 });
  });
});

describe('padEnd', () => {
  it('works with colors', () => {
    const str = '{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}';
    const exp = `${str}${new Array(19).join(' ')}`;
    expect(padEnd(str, 30)).to.eql(exp);
  });

  it('truncates if needed', () => {
    const str = '{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}';
    const exp = trunc(str, 2);
    expect(padEnd(str, 2)).to.eql(exp);
  });
});

describe('len', () => {
  it('ignores colors', () => {
    const str = '{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}';
    expect(len(str)).to.eql(12);
  });
});

describe('trunc', () => {
  it('truncates text', () => {
    expect(trunc('abcdef', 2)).to.eql('ab');
  });

  it('truncates null', () => {
    expect(trunc(null, 2)).to.eql('');
  });

  it('works with colors', () => {
    const str = '{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}';
    expect(trunc(str, 3)).to.eql('{fg-green}{bold}fel{/}');
    expect(trunc(str, 8)).to.eql('{fg-green}{bold}felipe{/bold}{/fg-green} {bold}c{/}');
    expect(trunc(str, 6)).to.eql('{fg-green}{bold}felipe{/}');
    expect(trunc(str, 1000)).to.eql('{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}');
    expect(trunc('{fg-green}', 3)).to.eql('{fg-green}');
  });
});
