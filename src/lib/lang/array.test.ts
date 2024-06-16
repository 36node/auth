import * as arrayUtils from './array';

describe('array contain', () => {
  it('should return true with sub arr', () => {
    const srcArr = ['a', 'b', 'c'];
    const sub = ['a', 'b'];
    expect(arrayUtils.contain(srcArr, sub)).toBe(true);
  });

  it('should return false with wrong sub arr', () => {
    const srcArr = ['a', 'b', 'c'];
    const sub = ['a', 'd'];
    expect(arrayUtils.contain(srcArr, sub)).toBe(false);
  });

  it('should return true with one element inside', () => {
    const srcArr = ['a', 'b', 'c'];
    const sub = 'a';
    expect(arrayUtils.contain(srcArr, sub)).toBe(true);
  });

  it('should return false with wrong element', () => {
    const srcArr = ['a', 'b', 'c'];
    const sub = 'd';
    expect(arrayUtils.contain(srcArr, sub)).toBe(false);
  });
});
