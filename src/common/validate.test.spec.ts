import { isNs } from './validate';

describe('common validate', () => {
  it('should validate ns', () => {
    // 空字符串
    expect(isNs('')).toBe(false);

    // 一个字符
    expect(isNs('x')).toBe(true);

    // 30 个字符
    expect(isNs('abcdefghijklmnopqrstuvwxyz01234')).toBe(true);

    // 210 个字符
    expect(
      isNs(
        'abcdefghijklmnopqrstuvwxyz01234abcdefghijklmnopqrstuvwxyz01234abcdefghijklmnopqrstuvwxyz01234abcdefghijklmnopqrstuvwxyz01234abcdefghijklmnopqrstuvwxyz01234abcdefghijklmnopqrstuvwxyz01234abcdefghijklmnopqrstuvwxyz01234'
      )
    ).toBe(false);
  });
});
