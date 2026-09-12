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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
