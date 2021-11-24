const _ = require('lodash');
const stringUtil = require('@utils/stringUtil');

function testInput({ limit, page }) {
  let paging = {};
  if (+limit) {
    paging = { data: true, limit, page };
  }
  console.log('paging: ', +limit, ' : ', paging);
}

// testInput({ limit: '' });
// testInput({ limit: 'abc' });
// testInput({ limit: '1' });
// testInput({ limit: null });
// testInput({ limit: undefined });
// testInput({ limit: 0 });
// testInput({ limit: 1 });

describe('testing jest', () => {
  it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
  });
});

describe('lodash', () => {
  it('Object assign null key should not contain key', () => {
    let { key } = {};
    let obj = Object.assign({}, !!key && { name: 'tuan' });
    expect(obj.name).toBeUndefined();
  });

  it('Split empty string should be empty', () => {
    // const ids = _.split('', ',');
    const ids = stringUtil.split('', ',');
    expect(ids.length).toBe(0);
  });
});
