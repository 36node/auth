import { randomBytes, randomInt } from 'crypto';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createConnection } from 'mongoose';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { CaptchaKind, CaptchaService } from 'src/captcha';
import { CaptchaRateLimitService } from 'src/captcha/captcha-rate-limit.service';
import { AllExceptionsFilter } from 'src/common/all-exceptions.filter';
import { exceptionFactory } from 'src/common/exception-factory';
import { auth } from 'src/config';
import { RedisClient } from 'src/redis/client';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import { UserService } from 'src/user';

const unique = () => randomBytes(8).toString('hex');
const phone = () => `18${randomInt(100000000, 1000000000)}`;

describe('Captcha workflow (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let users: UserService;
  let captchaService: CaptchaService;
  let redis: RedisClient;
  let limiter: CaptchaRateLimitService;
  const rateKeys = new Set<string>();
  const post = (path: string, body: object) =>
    request(app.getHttpServer()).post(path).set('x-api-key', auth.apiKey).send(body);
  const get = (path: string) =>
    request(app.getHttpServer()).get(path).set('x-api-key', auth.apiKey);
  const issue = async (kind: CaptchaKind, subject: string, purpose: string, extra = {}) => {
    for (const action of ['issue', 'verify'] as const)
      rateKeys.add(limiter.key(kind, subject, action));
    const response = await post('/captchas', { kind, subject, purpose, ...extra }).expect(201);
    return response.body;
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const connection = await createConnection(mongod.getUri()).asPromise();
    const fixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getConnectionToken())
      .useValue(connection)
      .compile();
    app = fixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, exceptionFactory }));
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost).httpAdapter));
    await app.init();
    users = app.get(UserService);
    captchaService = app.get(CaptchaService);
    redis = app.get(REDIS_CLIENT);
    limiter = app.get(CaptchaRateLimitService);
  }, 30000);
  afterAll(async () => {
    if (redis) await Promise.all([...rateKeys].map((k) => redis.del(k)));
    await app?.close();
    await mongod?.stop();
  });

  it.each([CaptchaKind.SMS, CaptchaKind.EMAIL])(
    'binds %s login to the actual account and consumes exactly once',
    async (kind) => {
      const field = kind === CaptchaKind.SMS ? 'phone' : 'email';
      const suffix = kind === CaptchaKind.SMS ? 'Phone' : 'Email';
      const subject = kind === CaptchaKind.SMS ? phone() : `${unique()}@example.com`;
      const other = kind === CaptchaKind.SMS ? phone() : `${unique()}@example.com`;
      await users.create({ [field]: subject });
      await users.create({ [field]: other });
      const code = await issue(kind, subject, 'login');
      rateKeys.add(limiter.key(kind, other, 'verify'));
      await post(`/auth/@loginBy${suffix}`, {
        [field]: other,
        key: code.key,
        code: code.code,
      }).expect(401);
      const result = await post(`/auth/@loginBy${suffix}`, {
        [field]: subject,
        key: code.key,
        code: code.code,
      }).expect(200);
      expect(result.body.token).toBeDefined();
      expect(result.body.key).toBeDefined();
      await post(`/auth/@loginBy${suffix}`, {
        [field]: subject,
        key: code.key,
        code: code.code,
      }).expect(401);
    }
  );

  it.each([CaptchaKind.SMS, CaptchaKind.EMAIL])(
    'supports %s auto-registration with login purpose',
    async (kind) => {
      const field = kind === CaptchaKind.SMS ? 'phone' : 'email';
      const suffix = kind === CaptchaKind.SMS ? 'Phone' : 'Email';
      const subject = kind === CaptchaKind.SMS ? phone() : `${unique()}@example.com`;
      const issued = await issue(kind, subject, 'login');
      await post(`/auth/@loginBy${suffix}`, {
        [field]: subject,
        key: issued.key,
        code: issued.code,
        autoRegister: true,
      }).expect(200);
    }
  );

  it.each([CaptchaKind.SMS, CaptchaKind.EMAIL])(
    'supports %s register/reset and rejects wrong purpose/type',
    async (kind) => {
      const field = kind === CaptchaKind.SMS ? 'phone' : 'email';
      const suffix = kind === CaptchaKind.SMS ? 'Phone' : 'Email';
      const subject = kind === CaptchaKind.SMS ? phone() : `${unique()}@example.com`;
      const registration = await issue(kind, subject, 'register');
      await post(`/auth/@loginBy${suffix}`, {
        [field]: subject,
        ...{ key: registration.key, code: registration.code },
        autoRegister: true,
      }).expect(401);
      await post(`/auth/@registerBy${suffix}`, {
        [field]: subject,
        key: registration.key,
        code: registration.code,
      }).expect(200);
      // The Redis subject quota remains; only remove the issuance bucket here to avoid waiting 60 s in this integration fixture.
      await redis.del(limiter.key(kind, subject, 'issue'));
      const reset = await issue(kind, subject, 'reset_password');
      await post(`/auth/@loginBy${suffix}`, {
        [field]: subject,
        key: reset.key,
        code: reset.code,
      }).expect(401);
      await post(`/auth/@resetPasswordBy${suffix}`, {
        [field]: subject,
        key: reset.key,
        code: reset.code,
        password: 'Abc12345@',
      }).expect(204);
      await post('/auth/@login', { login: subject, password: 'Abc12345@' }).expect(200);
    }
  );

  describe.each([CaptchaKind.SMS, CaptchaKind.EMAIL])('%s code authentication', (kind) => {
    const field = kind === CaptchaKind.SMS ? 'phone' : 'email';
    const suffix = kind === CaptchaKind.SMS ? 'Phone' : 'Email';
    const account = () => (kind === CaptchaKind.SMS ? phone() : `${unique()}@example.com`);
    const credentials = (
      subject: string,
      issued: { key: string; code: string },
      legacy = false
    ) => ({
      ...(legacy ? { [field]: subject } : { channel: kind, account: subject }),
      key: issued.key,
      code: issued.code,
    });
    const route = (operation: 'login' | 'register', legacy = false) =>
      `/auth/@${operation}By${legacy ? suffix : 'Code'}`;
    const registrationInfo = {
      ns: 'code-test',
      inviter: 'inviter-test',
      labels: ['code-registration'],
      registerIp: '127.0.0.1',
      registerRegion: '310000',
      type: 'app',
    };

    it.each([false, true])(
      'registers without a password and preserves fields (legacy=%s)',
      async (legacy) => {
        const subject = account();
        const issued = await issue(kind, subject, 'register');
        const response = await post(route('register', legacy), {
          ...credentials(subject, issued, legacy),
          ...registrationInfo,
          // The old registration contract must continue ignoring an extra password.
          ...(legacy && { password: 'Abc12345@' }),
        }).expect(200);
        expect(response.body).toMatchObject({ [field]: subject, ...registrationInfo });
        expect(response.body).not.toHaveProperty('password');
        expect(response.body).not.toHaveProperty('token');
        const user = await users.get(response.body.id);
        expect(user.password).toBeUndefined();
        expect(user.passwordChangedAt).toBeUndefined();
        const reused = await post(
          route('register', !legacy),
          credentials(subject, issued, !legacy)
        ).expect(400);
        expect(reused.body.code).toBe('CAPTCHA_INVALID');
      }
    );

    it('registers with a hashed password, supports both login methods, and never overwrites an existing user', async () => {
      const subject = account();
      const password = 'Abc12345@';
      const issued = await issue(kind, subject, 'register');
      const response = await post(route('register'), {
        ...credentials(subject, issued),
        ...registrationInfo,
        password,
      }).expect(200);
      expect(response.body).toMatchObject({ [field]: subject, ...registrationInfo });
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('token');
      const user = await users.get(response.body.id);
      expect(user.password).not.toBe(password);
      expect(users.checkPassword(user.password, password)).toBe(true);
      expect(user.passwordChangedAt).toBeInstanceOf(Date);
      await post('/auth/@login', { login: subject, password }).expect(200);
      rateKeys.add(`loginLock:${subject}`);
      await post('/auth/@login', { login: subject, password: 'Wrong123@' }).expect(401);

      await redis.del(limiter.key(kind, subject, 'issue'));
      const loginCode = await issue(kind, subject, 'login');
      await post(route('login'), credentials(subject, loginCode)).expect(200);
      await redis.del(limiter.key(kind, subject, 'issue'));
      const duplicate = await issue(kind, subject, 'register');
      const conflict = await post(route('register'), {
        ...credentials(subject, duplicate),
        password: 'Changed123@',
      }).expect(409);
      expect(conflict.body).toMatchObject({
        code: 'USER_ALREADY_EXISTS',
        message: `${field} ${subject} already exists.`,
      });
      await post(route('register'), credentials(subject, duplicate)).expect(400);
      const unchanged = await users.get(user.id);
      expect(unchanged.password).toBe(user.password);
      expect(unchanged.passwordChangedAt).toEqual(user.passwordChangedAt);
    });

    it.each([false, true])(
      'shares login code consumption and auto-registration fields (legacy=%s)',
      async (legacy) => {
        const subject = account();
        const issued = await issue(kind, subject, 'login');
        const response = await post(route('login', legacy), {
          ...credentials(subject, issued, legacy),
          ...registrationInfo,
          autoRegister: true,
          active: true,
          roles: ['code-test-role'],
          password: 'Ignored123@',
        }).expect(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.key).toBeDefined();
        const user = await users.get(response.body.subject);
        expect(user).toMatchObject({
          [field]: subject,
          ...registrationInfo,
          active: true,
          roles: ['code-test-role'],
        });
        expect(user.password).toBeUndefined();
        const reused = await post(
          route('login', !legacy),
          credentials(subject, issued, !legacy)
        ).expect(401);
        expect(reused.body).toMatchObject({
          code: 'AUTH_FAILED',
          message: `${field} or captcha code wrong`,
        });
        await redis.del(limiter.key(kind, subject, 'issue'));
        const next = await issue(kind, subject, 'login');
        const loggedIn = await post(route('login', !legacy), {
          ...credentials(subject, next, !legacy),
          autoRegister: true,
          roles: ['must-not-replace-existing-roles'],
        }).expect(200);
        expect(loggedIn.body.subject).toBe(user.id);
        expect((await users.get(user.id)).roles).toEqual(['code-test-role']);
      }
    );

    it.each([false, true])(
      'preserves missing-user, inactive-user and duplicate errors (legacy=%s)',
      async (legacy) => {
        const subject = account();
        const missing = await issue(kind, subject, 'login');
        const failure = await post(
          route('login', legacy),
          credentials(subject, missing, legacy)
        ).expect(401);
        expect(failure.body).toMatchObject({
          code: 'AUTH_FAILED',
          message: `${field} or captcha code wrong`,
        });
        // A valid code is consumed even when the user does not exist.
        await post(route('login', !legacy), {
          ...credentials(subject, missing, !legacy),
          autoRegister: true,
        }).expect(401);
        await redis.del(limiter.key(kind, subject, 'issue'));
        const inactive = await issue(kind, subject, 'login');
        const blocked = await post(route('login', legacy), {
          ...credentials(subject, inactive, legacy),
          autoRegister: true,
          active: false,
        }).expect(403);
        expect(blocked.body.code).toBe('USER_INACTIVE');
        const user =
          kind === CaptchaKind.SMS
            ? await users.findByPhone(subject)
            : await users.findByEmail(subject);
        expect(user.active).toBe(false);
        await users.update(user.id, { active: true });
        await post(route('login', !legacy), credentials(subject, inactive, !legacy)).expect(401);
        await redis.del(limiter.key(kind, subject, 'issue'));
        const duplicate = await issue(kind, subject, 'register');
        const conflict = await post(
          route('register', legacy),
          credentials(subject, duplicate, legacy)
        ).expect(409);
        expect(conflict.body).toMatchObject({
          code: 'USER_ALREADY_EXISTS',
          message: `${field} ${subject} already exists.`,
        });
        await post(route('register', !legacy), credentials(subject, duplicate, !legacy)).expect(
          400
        );
      }
    );

    it('binds the new endpoints to the account, channel and purpose', async () => {
      const subject = account();
      const other = account();
      const issued = await issue(kind, subject, 'register');
      rateKeys.add(limiter.key(kind, other, 'verify'));
      await post(route('register'), credentials(other, issued)).expect(400);
      await post(route('login'), {
        ...credentials(subject, issued),
        autoRegister: true,
        purpose: 'register',
      }).expect(401);
      const otherKind = kind === CaptchaKind.SMS ? CaptchaKind.EMAIL : CaptchaKind.SMS;
      const otherSubject = otherKind === CaptchaKind.SMS ? phone() : `${unique()}@example.com`;
      rateKeys.add(limiter.key(otherKind, otherSubject, 'verify'));
      await post(route('register'), {
        ...credentials(subject, issued),
        channel: otherKind,
        account: otherSubject,
      }).expect(400);
      await post(route('register'), credentials(subject, issued)).expect(200);
      await redis.del(limiter.key(kind, subject, 'issue'));
      const login = await issue(kind, subject, 'login');
      await post(route('register'), { ...credentials(subject, login), purpose: 'login' }).expect(
        400
      );
      await post(route('login'), credentials(other, login)).expect(401);
      await post(route('login'), {
        ...credentials(subject, login),
        channel: otherKind,
        account: otherSubject,
      }).expect(401);
      await post(route('login'), credentials(subject, login)).expect(200);
    });

    it('rejects invalid passwords before consuming the registration code', async () => {
      const subject = account();
      const issued = await issue(kind, subject, 'register');
      for (const password of [null, '', 'weak', 12345678, {}, []]) {
        const result = await post(route('register'), {
          ...credentials(subject, issued),
          password,
        }).expect(400);
        expect(result.body.code).toBe('VALIDATION_FAILED');
        expect(result.body.details).toEqual(
          expect.arrayContaining([expect.objectContaining({ field: 'password' })])
        );
      }
      await post(route('register'), {
        ...credentials(subject, issued),
        password: 'Abc12345@',
      }).expect(200);
    });

    it.each(['login', 'register'] as const)(
      'validates %s credentials and requires an API key',
      async (operation) => {
        const subject = account();
        const issued = await issue(kind, subject, operation);
        const body = credentials(subject, issued);
        const invalid: object[] = [
          { ...body, channel: 'image' },
          { ...body, channel: null },
          { ...body, account: kind === CaptchaKind.SMS ? 'user@example.com' : '13800138000' },
          { ...body, account: null },
          { ...body, code: 123456 },
          { ...body, key: '' },
        ];
        for (const field of ['channel', 'account', 'key', 'code']) {
          const missing = { ...body };
          delete missing[field];
          invalid.push(missing);
        }
        for (const requestBody of invalid) {
          const response = await post(route(operation), requestBody).expect(400);
          expect(response.body.code).toBe('VALIDATION_FAILED');
        }
        await request(app.getHttpServer()).post(route(operation)).send(body).expect(403);
        await post(route(operation), { ...body, autoRegister: true }).expect(200);
      }
    );
  });

  it('consumes image verification and rejects anonymous-session mismatch', async () => {
    const subject = unique();
    const image = await issue(CaptchaKind.IMAGE, subject, 'send_sms', { code: 'Ab1Z' });
    const body = { kind: 'image', subject, purpose: 'send_sms', key: image.key, code: 'aB1z' };
    rateKeys.add(limiter.key(CaptchaKind.IMAGE, `${subject}-wrong`, 'verify'));
    expect(
      (await post('/captchas/@verifyCaptcha', { ...body, subject: `${subject}-wrong` }).expect(200))
        .body.success
    ).toBe(false);
    expect((await post('/captchas/@verifyCaptcha', body).expect(200)).body.success).toBe(true);
    expect((await post('/captchas/@verifyCaptcha', body).expect(200)).body.success).toBe(false);
  });

  it('does not accept caller-defined OTPs or legacy creation, and removes PATCH', async () => {
    await post('/captchas', { key: 'legacy', code: '123456' }).expect(400);
    await post('/captchas', {
      kind: 'sms',
      subject: phone(),
      purpose: 'login',
      code: '123456',
    }).expect(400);
    const issued = await issue(CaptchaKind.IMAGE, unique(), 'send_sms', {
      key: 'ignored',
      expireAt: '2099-01-01',
    });
    expect(issued.key).not.toBe('ignored');
    expect(new Date(issued.expireAt).getTime()).toBeLessThan(Date.now() + 125000);
    await request(app.getHttpServer())
      .patch(`/captchas/${issued.id}`)
      .set('x-api-key', auth.apiKey)
      .send({ code: 'evil' })
      .expect(404);
    for (const body of [
      (await get(`/captchas/${issued.id}`).expect(200)).body,
      ...(await get('/captchas').expect(200)).body,
    ]) {
      expect(body).not.toHaveProperty('code');
      expect(body).not.toHaveProperty('codeHash');
    }
    await request(app.getHttpServer())
      .delete(`/captchas/${issued.key}`)
      .set('x-api-key', auth.apiKey)
      .expect(204);
    expect(await captchaService.get(issued.id)).toBeNull();
  });

  it('returns 429 plus Retry-After and requires the internal API key', async () => {
    const subject = phone();
    await issue(CaptchaKind.SMS, subject, 'login');
    const result = await post('/captchas', {
      kind: 'sms',
      subject,
      purpose: 'reset_password',
    }).expect(429);
    expect(Number(result.headers['retry-after'])).toBeGreaterThan(0);
    expect(result.body.code).toBe('CAPTCHA_RATE_LIMITED');
    await request(app.getHttpServer())
      .post('/captchas')
      .send({ kind: 'sms', subject, purpose: 'login' })
      .expect(403);
  });
});
