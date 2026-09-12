import { Injectable } from '@nestjs/common';

import * as config from 'src/config';

export enum CaptchaKind {
  IMAGE = 'image',
  SMS = 'sms',
  EMAIL = 'email',
}

export interface RateWindow {
  windowS: number;
  limit: number;
}

export interface CaptchaPolicy {
  expiresInS: number;
  maxAttempts: number;
  issueIntervalS: number;
  issueLimits: RateWindow[];
  verifyLimits: RateWindow[];
}

const deliveryPolicy = {
  maxAttempts: 5,
  issueIntervalS: 60,
  issueLimits: [
    { windowS: 3600, limit: 5 },
    { windowS: 86400, limit: 10 },
  ],
  verifyLimits: [{ windowS: 600, limit: 20 }],
};

export const DEFAULT_CAPTCHA_POLICIES: Record<CaptchaKind, CaptchaPolicy> = {
  image: {
    expiresInS: 120,
    maxAttempts: 3,
    issueIntervalS: 1,
    issueLimits: [{ windowS: 60, limit: 20 }],
    verifyLimits: [{ windowS: 60, limit: 30 }],
  },
  sms: { ...deliveryPolicy, expiresInS: 300 },
  email: { ...deliveryPolicy, expiresInS: 600 },
};

@Injectable()
export class CaptchaPolicyService {
  readonly policies: Record<CaptchaKind, CaptchaPolicy>;
  readonly redisPrefix = config.captcha.redisPrefix;

  constructor() {
    try {
      const overrides = JSON.parse(config.captcha.policyJson || '{}');
      if (
        !overrides ||
        Array.isArray(overrides) ||
        typeof overrides !== 'object' ||
        Object.keys(overrides).some(
          (key) => !Object.values(CaptchaKind).includes(key as CaptchaKind)
        )
      )
        throw new Error();
      this.policies = {} as Record<CaptchaKind, CaptchaPolicy>;
      for (const kind of Object.values(CaptchaKind)) {
        const override = overrides[kind] === undefined ? {} : overrides[kind];
        if (
          !override ||
          typeof override !== 'object' ||
          Array.isArray(override) ||
          Object.keys(override).some(
            (key) => !Object.prototype.hasOwnProperty.call(DEFAULT_CAPTCHA_POLICIES[kind], key)
          )
        )
          throw new Error();
        const policy = { ...DEFAULT_CAPTCHA_POLICIES[kind], ...override };
        const positive = (n: number, max: number) => Number.isInteger(n) && n > 0 && n <= max;
        if (
          !positive(policy.expiresInS, 600) ||
          !positive(policy.maxAttempts, 10) ||
          !positive(policy.issueIntervalS, 86400)
        )
          throw new Error();
        for (const windows of [policy.issueLimits, policy.verifyLimits]) {
          if (
            !Array.isArray(windows) ||
            windows.length < 1 ||
            windows.length > 3 ||
            windows.some((w) => !w || !positive(w.windowS, 86400) || !positive(w.limit, 10000))
          )
            throw new Error();
        }
        this.policies[kind] = policy;
      }
      if (!this.redisPrefix || /[{}\s]/.test(this.redisPrefix)) throw new Error();
    } catch {
      throw new Error('Invalid CAPTCHA_POLICY_JSON or CAPTCHA_REDIS_PREFIX');
    }
  }
}
