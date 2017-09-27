const { formatRows, maxLengths, stripColors, hasColors, spaces, padEnd, len, trunc } = require('../src/utils');

describe('hasColors', () => {
  it('is false for string with no colors', () => {
    expect(hasColors('res')).to.be.false;
  });

  it('is true for string with colors', () => {
    expect(hasColors('{bold}res{/bold}')).to.be.true;
  });
});

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
      { ts: '2012-01-01 10:01:01.12',  lvl: 'debug', msg: '{fg-yellow}something{/fg-yellow}' },
      { ts: '2012-01-01 10:01:01.123', lvl: 'info',  msg: 'This other long thing happened while I was asleep' },
    ];
    const columns = [
      { key: 'ts' },
      { key: 'lvl', format: l => l === 'debug' ? `{fg-yellow}${l}{/fg-yellow}` : l },
      { key: 'msg' },
    ];
    const exp = [
      '2012-01-01 10:01:01.12  {fg-yellow}debug{/fg-yellow} {fg-yellow}something{/fg-yellow}                  ',
      '2012-01-01 10:01:01.123 info  This other long thing happened while I was asleep ',
    ];
    const str = formatRows(data, columns, 1, 80);

    expect(`|${str[0]}|`).to.eql(`|${exp[0]}|`);
    expect(`|${str[1]}|`).to.eql(`|${exp[1]}|`);
  });
});

describe('maxLengths', () => {
  it('pads the last item of the array', () => {
    const columns = [
      { key: 'one' }, { key: 'two' }, { key: 'three' },
    ];
    const arr = [
      { one: 'a', two: '{fg-yellow}babc{/fg-yellow}' },
      { one: 'aa', three: 'kkk' },
      { two: 'a', three: 'ssss' },
    ];
    expect(maxLengths(columns, arr, 1, 20)).to.eql({ one: 2, two: 4, three: 12 });
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

  it('considers colors when flag set', () => {
    const str = '{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}';
    expect(len(str, true)).to.eql(str.length);
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
    expect(trunc('{fg-green}{/fg-green}', 3)).to.eql('{fg-green}{/fg-green}');
  });

  it('ignores colors', () => {
    const str = '{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}';
    expect(trunc(str, 3, true)).to.eql('{fg');
    expect(trunc(str, 8, true)).to.eql('{fg-gree');
    expect(trunc(str, 6, true)).to.eql('{fg-gr');
    expect(trunc(str, 1000, true)).to.eql('{fg-green}{bold}felipe{/bold}{/fg-green} {bold}coury{/bold}');
    expect(trunc('{fg-green}{/fg-green}', 3, true)).to.eql('{fg');
  });

  it('works with JSON', () => {
    const str = '{"res":{"statusCode":401},"req":{"url":"/queues","headers":{"host":"qa-cognito.progenity.com","x-real-ip":"172.18.1.116","x-forwarded-for":"172.18.1.116","x-forwarded-proto"     :"https","connection":"keep-alive","user-agent":"Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0","accept":"application/json, text/plain, */*","acc     ept-language":"en-US,en;q=0.5","accept-encoding":"gzip, deflate, br","authorization":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhcnQuaGF1c2VyQHByb2dlbml0eS5jb218QU5OU1     NJU19TUUxBZG1pbnMsRVhDSF9BRE1JTixGU19BRE1JTixGU19JVF9BRE1JTixJVCBEcml2ZSBBY2Nlc3MsSVQgR3JvdXAsSVRfTURNLEluZm9ybWF0aW9uVGVjaG5vbG9neVNoYXJlQWNjZXNzLExJUyxMSVNfVEVBTSxNQUlMX0F     MTF9FTVBMT1lFRVMsTUFJTF9JVCxNQUlMX0xJUyxNQUlMX1NRTEJhY2t1cFJlcG9ydHMsTWFzcyBPcmRlcnMgQWNjZXNzLE9yZ2FuaXphdGlvbiBNYW5hZ2VtZW50LFBSV19BZG1pbixQcmV2ZW50aW9uX1Jlc3VsdHMsUkVNT1RF     X0FDQ0VTU19VU0VSLFJlY2lwaWVudCBNYW5hZ2VtZW50LFJlcG9ydGluZ0dyb3VwIHs0OWJkNTc1NS00MGVmLTQ3NTctYjQ1Yi0yMWVhNjIyMGE0YzZ9LFJlcG9ydGluZ0dyb3VwIHs3YmU4OWJhOC0wYTVkLTQyNzEtYjc2Zi1mZ     WZjMjJlZjY1NGF9LFNRTFJlYWRBY2Nlc3MsU2VydmVyIE1hbmFnZW1lbnQsU29sYXJ3aW5kc0xJU1VzZXIsVGVjaG5pY2FsIFNlcnZpY2VzLFdIRCBHcm91cCxYV2lraUhlbHBkZXNrLFhXaWtpVXNlcnMiLCJpYXQiOjE1MDYzNj     g5MDAsImV4cCI6MTUwNjM3MjUwMH0.x0bV5p4WrOn8Vz_8zReD4FcCRX4BR9o6iu0SVZNAuV0","referer":"https://qa-cognito.progenity.com/queues","cookie":"_ga=GA1.2.424980183.1488298724","if-     none-match":"W/\"1963-QHmYfE6rpcPujtkDZuFGu3gZmeI\""},"method":"GET","httpVersion":"1.0","originalUrl":"/queues","query":{}},"responseTime":9,"level":"info","message":"GET /     queues 401 9ms","timestamp":"2017-09-26T13:10:18.127Z"}';
    expect(trunc(str, 10)).to.eql('{"res":{"s');
  });
});
