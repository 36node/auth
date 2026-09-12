import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, createConnection, Model } from 'mongoose';

import { CaptchaKind, CaptchaPolicyService } from './captcha-policy.service';
import { CaptchaRateLimitService } from './captcha-rate-limit.service';
import { CaptchaService } from './captcha.service';
import { Captcha, CaptchaDocument, CaptchaSchema, CaptchaStatus } from './entities/captcha.entity';

const context = (kind = CaptchaKind.SMS, subject = '13800138000', purpose = 'login') => ({
  kind,
  subject,
  purpose,
});
const answer = (captcha: any, changes = {}) => ({
  key: captcha.key,
  code: captcha.code,
  kind: captcha.kind,
  purpose: captcha.purpose,
  subject: captcha.subject,
  ...changes,
});

describe('Captcha security', () => {
  let mongod: MongoMemoryServer;
  let connection: Connection;
  let model: Model<CaptchaDocument>;
  let service: CaptchaService;
  const limiter = { reserve: jest.fn().mockResolvedValue(undefined) };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
      instance: { args: ['--setParameter', 'ttlMonitorEnabled=false'] },
    });
    connection = await createConnection(mongod.getUri()).asPromise();
    model = connection.model<CaptchaDocument>(Captcha.name, CaptchaSchema);
    await model.syncIndexes();
    const module = await Test.createTestingModule({
      providers: [
        CaptchaService,
        CaptchaPolicyService,
        { provide: getModelToken(Captcha.name), useValue: model },
        { provide: CaptchaRateLimitService, useValue: limiter },
      ],
    }).compile();
    service = module.get(CaptchaService);
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    limiter.reserve.mockReset().mockResolvedValue(undefined);
    await model.deleteMany({});
  });
  afterAll(async () => {
    await connection?.close();
    await mongod?.stop();
  });

  it.each([CaptchaKind.IMAGE, CaptchaKind.SMS, CaptchaKind.EMAIL])(
    'issues and consumes %s; reads contain only metadata',
    async (kind) => {
      const issued = await service.create(context(kind));
      expect(issued.key).toMatch(/^[a-f0-9]{32}$/);
      expect(issued.code).toMatch(kind === CaptchaKind.IMAGE ? /^[A-Z0-9]{4}$/ : /^\d{6}$/);
      const stored = await model.collection.findOne({ key: issued.key });
      expect(stored.code).toBe(issued.code);
      expect(stored).not.toHaveProperty('codeHash');
      expect(await model.findOne({ key: issued.key }).lean()).not.toHaveProperty('code');
      for (const metadata of [await service.get(issued.id), ...(await service.list({}))]) {
        expect(metadata).not.toHaveProperty('code');
        expect(metadata).not.toHaveProperty('codeHash');
      }
      expect(await service.consume(answer(issued))).toBe(true);
      expect(await service.consume(answer(issued))).toBe(false);
      expect(await model.collection.findOne({ key: issued.key })).not.toHaveProperty('code');
    }
  );

  it('compares image answers without case sensitivity and refuses caller supplied OTPs', async () => {
    const issued = await service.create({ ...context(CaptchaKind.IMAGE), code: 'Ab1Z' });
    expect(await service.consume(answer(issued, { code: 'aB1z' }))).toBe(true);
    for (const kind of [CaptchaKind.SMS, CaptchaKind.EMAIL]) {
      await expect(service.create({ ...context(kind), code: '123456' })).rejects.toMatchObject({
        status: 400,
      });
    }
  });

  it('rejects every context mismatch without consuming the correct challenge', async () => {
    const issued = await service.create(context());
    for (const change of [
      { key: 'wrong' },
      { subject: 'another-account' },
      { purpose: 'reset_password' },
      { kind: CaptchaKind.EMAIL },
    ]) {
      expect(await service.consume(answer(issued, change))).toBe(false);
    }
    expect(await service.consume(answer(issued))).toBe(true);
  });

  it('rejects expiry before physical TTL deletion', async () => {
    const issued = await service.create(context());
    await model.collection.updateOne(
      { key: issued.key },
      { $set: { expireAt: new Date(Date.now() - 1) } }
    );
    expect(await service.consume(answer(issued))).toBe(false);
    expect(await model.collection.findOne({ key: issued.key })).not.toBeNull();
  });

  it('rotates the key, resets per-challenge attempts, and stale revocation cannot delete the replacement', async () => {
    const first = await service.create(context());
    await service.consume(answer(first, { code: 'wrong' }));
    const second = await service.create(context());
    expect(first.key).not.toBe(second.key);
    expect(second.failedAttempts).toBe(0);
    expect(await service.count({})).toBe(1);
    expect(await service.consume(answer(first))).toBe(false);
    await service.delete(first.key);
    expect(await service.consume(answer(second))).toBe(true);
    await service.delete(second.key);
    await service.delete(second.key);
    expect(await service.count({})).toBe(0);
  });

  it('accepts exactly one of 50 concurrent correct submissions', async () => {
    const issued = await service.create(context());
    const results = await Promise.all(
      Array.from({ length: 50 }, () => service.consume(answer(issued)))
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('counts concurrent wrong submissions only to the configured maximum', async () => {
    const issued = await service.create(context());
    await Promise.all(
      Array.from({ length: 50 }, () => service.consume(answer(issued, { code: 'wrong' })))
    );
    expect(await service.get(issued.id)).toMatchObject({
      failedAttempts: 5,
      status: CaptchaStatus.LOCKED,
    });
    expect(await service.consume(answer(issued))).toBe(false);
  });

  it('serializes the final wrong attempt against correct submissions', async () => {
    const issued = await service.create(context(CaptchaKind.IMAGE));
    await service.consume(answer(issued, { code: 'wrong' }));
    await service.consume(answer(issued, { code: 'wrong' }));
    const result = await Promise.all([
      service.consume(answer(issued, { code: 'wrong' })),
      ...Array.from({ length: 20 }, () => service.consume(answer(issued))),
    ]);
    const current = await service.get(issued.id);
    expect(result.filter(Boolean).length).toBeLessThanOrEqual(1);
    expect(current.failedAttempts).toBeLessThanOrEqual(3);
    expect(current.status).toBe(result.some(Boolean) ? CaptchaStatus.USED : CaptchaStatus.LOCKED);
  });

  it('serializes reissue against consumption and never lets an old key touch the replacement', async () => {
    const first = await service.create(context());
    const [second] = await Promise.all([service.create(context()), service.consume(answer(first))]);
    expect(await service.consume(answer(first))).toBe(false);
    expect(await service.consume(answer(second))).toBe(true);
  });

  it('does not mutate the challenge when reserving quota fails', async () => {
    const issued = await service.create(context());
    limiter.reserve.mockRejectedValueOnce(new Error('rate unavailable'));
    await expect(service.consume(answer(issued))).rejects.toThrow();
    expect(await service.get(issued.id)).toMatchObject({
      status: CaptchaStatus.PENDING,
      failedAttempts: 0,
    });
  });

  it('returns 503 without echoing database error content or retrying an uncertain consume', async () => {
    const issued = await service.create(context());
    const exec = jest.fn().mockRejectedValue(new Error('secret-code-and-query'));
    const query: any = { select: () => query, maxTimeMS: () => query, lean: () => query, exec };
    jest.spyOn(model, 'findOneAndUpdate').mockReturnValueOnce(query);
    await expect(service.consume(answer(issued))).rejects.toMatchObject({
      status: 503,
      response: { code: 'CAPTCHA_UNAVAILABLE' },
    });
    expect(exec).toHaveBeenCalledTimes(1);
  });
  it('returns 503 on a pending consume, never retries it, and does not revive a late consumption', async () => {
    const issued = await service.create(context());
    const previous = await model.collection.findOne({ key: issued.key });
    let complete: (value: any) => void;
    const exec = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      })
    );
    const query: any = { select: () => query, maxTimeMS: () => query, lean: () => query, exec };
    const spy = jest.spyOn(model, 'findOneAndUpdate').mockReturnValueOnce(query);
    jest.useFakeTimers();
    try {
      const pending = service.consume(answer(issued));
      const rejected = expect(pending).rejects.toMatchObject({ status: 503 });
      await jest.advanceTimersByTimeAsync(2001);
      await rejected;
    } finally {
      jest.useRealTimers();
    }
    // Simulate a write acknowledged after the HTTP deadline. No retry or rollback is allowed.
    await model.collection.updateOne(
      { key: issued.key },
      { $set: { status: CaptchaStatus.USED }, $unset: { code: '' } }
    );
    complete(previous);
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledTimes(1);
    expect(await service.consume(answer(issued))).toBe(false);
  });
  it('checks expiry at database execution time after a queued request', async () => {
    const issued = await service.create(context());
    await model.collection.updateOne(
      { key: issued.key },
      { $set: { expireAt: new Date(Date.now() + 200) } }
    );
    const find = model.findOneAndUpdate.bind(model) as any;
    jest.spyOn(model, 'findOneAndUpdate').mockImplementationOnce((...args: any[]) => {
      const query = find(...args);
      const exec = query.exec.bind(query);
      query.exec = async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return exec();
      };
      return query;
    });
    expect(await service.consume(answer(issued))).toBe(false);
    expect(await service.get(issued.id)).toMatchObject({ status: CaptchaStatus.PENDING });
  });
});
