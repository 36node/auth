import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { CaptchaPurpose, CaptchaService } from 'src/captcha';
import { Role } from 'src/common';
import { NamespaceService } from 'src/namespace';
import { SessionWithToken } from 'src/session';
import { UserService } from 'src/user';
import { UserDocument } from 'src/user/entities/user.entity';

import { AppModule } from '../src/app.module';

const scope = 'test3';
const username = 'test-user3';
const phone = '12345678910';
const dialingPrefix = '+55';

describe('reset password (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let captchaService: CaptchaService;
  let user: UserDocument;
  let namespaceService: NamespaceService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/reset-password-by-phone`;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    captchaService = moduleFixture.get<CaptchaService>(CaptchaService);
    namespaceService = moduleFixture.get<NamespaceService>(NamespaceService);

    await namespaceService.create({
      name: faker.company.name(),
      key: scope,
    });

    user = await userService.upsert({
      username: username,
      ns: scope,
      roles: [Role.AUTH_MANAGER],
      phone: phone,
      dialingPrefix: dialingPrefix,
    });
    user.password = 'test123';

    await user.save();
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  it('reset password by phone with wrong dialing prefix', async () => {
    // 获取手机验证码
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.RESET_PASSWORD, dialingPrefix, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey(dialingPrefix + phone, scope, {
      purpose: CaptchaPurpose.RESET_PASSWORD,
    });
    expect(captcha.key).toBe(dialingPrefix + phone);
    expect(captcha.purpose).toBe(CaptchaPurpose.RESET_PASSWORD);

    // 通过手机号、验证码更新密码, 使用了错误的区号，失败
    const resetPasswordResp = await request(app.getHttpServer())
      .post('/me/@resetPassword')
      .send({
        code: captcha.code,
        phone,
        dialingPrefix: '+88888',
        scope,
        newPassword: 'test567',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(resetPasswordResp.statusCode).toBe(400);
  });

  it(`reset password by phone success`, async () => {
    // 获取手机验证码
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.RESET_PASSWORD, dialingPrefix, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey(dialingPrefix + phone, scope, {
      purpose: CaptchaPurpose.RESET_PASSWORD,
    });
    expect(captcha.key).toBe(dialingPrefix + phone);
    expect(captcha.purpose).toBe(CaptchaPurpose.RESET_PASSWORD);

    // 通过手机号、验证码更新密码
    const resetPasswordResp = await request(app.getHttpServer())
      .post('/me/@resetPassword')
      .send({
        code: captcha.code,
        phone,
        dialingPrefix: dialingPrefix,
        scope,
        newPassword: 'Test_test567',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(resetPasswordResp.statusCode).toBe(201);

    // login with new password
    const sessionResp = await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope,
        login: user.username,
        password: 'Test_test567',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const session: SessionWithToken = sessionResp.body;
    expect(sessionResp.statusCode).toBe(200);
    expect(session).toBeDefined();
  });
});
