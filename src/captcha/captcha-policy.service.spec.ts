import * as config from 'src/config';

import { CaptchaPolicyService, DEFAULT_CAPTCHA_POLICIES } from './captcha-policy.service';

describe('Captcha policy startup validation', () => {
  const original = { ...config.captcha };
  afterEach(() => Object.assign(config.captcha, original));
  it('starts with default policies without a separate secret', () => {
    config.captcha.policyJson = '{}';
    expect(new CaptchaPolicyService().policies).toEqual(DEFAULT_CAPTCHA_POLICIES);
  });
  it.each([
    '{',
    'null',
    '{"sms":null}',
    '{"sms":{"toString":123}}',
    '{"sms":{"maxAttempts":0}}',
    '{"sms":{"expiresInS":601}}',
    '{"sms":{"verifyLimits":[]}}',
  ])('rejects invalid policy', (json) => {
    config.captcha.policyJson = json;
    expect(() => new CaptchaPolicyService()).toThrow('CAPTCHA_POLICY_JSON');
  });
  it('merges valid server overrides and preserves the other defaults', () => {
    config.captcha.policyJson = '{"sms":{"maxAttempts":3}}';
    const service = new CaptchaPolicyService();
    expect(service.policies.sms.maxAttempts).toBe(3);
    expect(service.policies.email.expiresInS).toBe(600);
  });
});
