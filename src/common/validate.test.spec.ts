import { detectLoginField, isNs, isPhone } from './validate';

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

  describe('isPhone', () => {
    it('should accept CN mobile with or without separators', () => {
      expect(isPhone('18612345678')).toBe(true);
      expect(isPhone('186-1234-5678')).toBe(true);
      expect(isPhone('186 1234 5678')).toBe(true);
    });

    it('should accept international numbers with + prefix', () => {
      expect(isPhone('+1-415-555-2671')).toBe(true);
      expect(isPhone('+44 7911 123456')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isPhone('11111111111')).toBe(false);
      expect(isPhone('12345')).toBe(false);
      expect(isPhone('alice@test.com')).toBe(false);
      expect(isPhone('447911123456')).toBe(false);
    });
  });

  describe('detectLoginField', () => {
    it('should detect email, phone and username', () => {
      expect(detectLoginField('admin@36node.com')).toBe('email');
      expect(detectLoginField('18612345678')).toBe('phone');
      expect(detectLoginField('186-1234-5678')).toBe('phone');
      expect(detectLoginField('+1-415-555-2671')).toBe('phone');
      expect(detectLoginField('alice123')).toBe('username');
    });
  });
});
