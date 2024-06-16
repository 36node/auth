import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CaptchaService } from './captcha.service';
import { Captcha, CaptchaPurpose, CaptchaSchema } from './entities/captcha.entity';

const mockCaptcha = {
  key: 'key',
  code: '123456',
  purpose: CaptchaPurpose.LOGIN,
  scope: 'test',
};

describe('CaptchaService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: CaptchaService;
  let captchaModel: Model<Captcha>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    captchaModel = mongoConnection.model<Captcha>(Captcha.name, CaptchaSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaptchaService,
        {
          provide: getModelToken(Captcha.name),
          useValue: captchaModel,
        },
      ],
    }).compile();

    service = module.get<CaptchaService>(CaptchaService);
    await captchaModel.syncIndexes();
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createCaptcha', () => {
    it('should create a captcha', async () => {
      const captcha = await service.create({
        scope: 'test',
        ...mockCaptcha,
      });
      expect(captcha).toBeDefined();
      expect(captcha).toMatchObject(mockCaptcha);
    });
  });

  describe('upsertCaptchaByKey', () => {
    it('should upsert a captcha by key', async () => {
      const { key, scope, ...rest } = mockCaptcha;
      const captcha = await service.upsertByKey(key, scope, rest);

      expect(captcha).toMatchObject(mockCaptcha);

      const upsertDoc = { code: '234567' };
      const upserted = await service.upsertByKey(key, scope, upsertDoc);
      expect(upserted).toBeDefined();
      expect(upserted).toMatchObject(upsertDoc);
    });
  });

  describe('getCaptcha', () => {
    it('should get a captcha', async () => {
      const captcha = await service.create({
        scope: 'test',
        ...mockCaptcha,
      });
      expect(captcha).toBeDefined();

      const founded = await service.get(captcha.id);
      expect(founded).toBeDefined();
      expect(founded).toMatchObject(mockCaptcha);
    });
  });

  describe('getCaptchaByKey', () => {
    it('should get a captcha by key', async () => {
      const captcha = await service.create({
        scope: 'test',
        ...mockCaptcha,
      });
      expect(captcha).toBeDefined();

      const founded = await service.getByKey(captcha.key, captcha.scope, { code: captcha.code });
      expect(founded).toBeDefined();
      expect(founded).toMatchObject(mockCaptcha);

      // 验证过期时间
      await service.update(founded.id, {
        expireAt: dayjs().subtract(1, 'second').toDate(),
      });
      expect(await service.getByKey(captcha.key, captcha.scope, { code: captcha.code })).toBeNull();

      const founded2 = await service.get(founded.id);
      expect(founded2).toBeDefined();
    });
  });

  describe('updateCaptcha', () => {
    it('should update a captcha', async () => {
      const captcha = await service.create({
        scope: 'test',
        ...mockCaptcha,
      });
      expect(captcha).toBeDefined();

      const updateDoc = { code: '234567' };
      const updated = await service.update(captcha.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('deleteCaptcha', () => {
    it('should delete a captcha', async () => {
      const captcha = await service.create({
        scope: 'test',
        ...mockCaptcha,
      });
      expect(captcha).toBeDefined();

      await service.delete(captcha.id);
      const found = await service.get(captcha.id);
      expect(found).toEqual(null);
    });
  });
});
