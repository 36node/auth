import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { CaptchaService } from './captcha.service';
import { Captcha, CaptchaSchema } from './entities/captcha.entity';

const mockCaptcha = (withCode = false) => ({
  key: nanoid(8),
  ...(withCode && { code: nanoid(6) }),
});

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
      const dto = mockCaptcha();
      const captcha = await service.create(dto);
      expect(captcha).toBeDefined();
      expect(captcha).toMatchObject(dto);
    });
  });

  describe('upsertCaptchaByKey', () => {
    it('should upsert a captcha by key', async () => {
      const dto = mockCaptcha();
      const { key, ...rest } = dto;
      const captcha = await service.upsertByKey(key, rest);

      expect(captcha).toMatchObject(dto);

      const upsertDoc = { code: '234567' };
      const upserted = await service.upsertByKey(key, upsertDoc);
      expect(upserted).toBeDefined();
      expect(upserted.code).toBe(upsertDoc.code);
    });
  });

  describe('getCaptcha', () => {
    it('should get a captcha', async () => {
      const dto = mockCaptcha();
      const captcha = await service.create(dto);
      expect(captcha).toBeDefined();

      const founded = await service.get(captcha.id);
      expect(founded).toBeDefined();
      expect(founded).toMatchObject(captcha.toObject());
    });
  });

  describe('getCaptchaByKey', () => {
    it('should get a captcha by key', async () => {
      const dto = mockCaptcha();
      const captcha = await service.create(dto);
      expect(captcha).toBeDefined();

      const founded = await service.getByKey(dto.key);
      expect(founded).toBeDefined();
      expect(founded).toMatchObject(captcha.toObject());
    });
  });

  describe('updateCaptcha', () => {
    it('should update a captcha', async () => {
      const dto = mockCaptcha();
      const captcha = await service.create(dto);
      expect(captcha).toBeDefined();

      const updateDoc = { code: '234567' };
      const updated = await service.update(captcha.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated.code).toBe(updateDoc.code);
    });
  });

  describe('deleteCaptcha', () => {
    it('should delete a captcha', async () => {
      const dto = mockCaptcha();
      const captcha = await service.create(dto);
      expect(captcha).toBeDefined();

      await service.delete(captcha.id);
      const found = await service.get(captcha.id);
      expect(found).toEqual(null);
    });
  });
});
