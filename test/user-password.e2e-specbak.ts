import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { CaptchaPurpose, CaptchaService } from 'src/captcha';
import { settings } from 'src/config';
import { MongoErrorsInterceptor } from 'src/mongo';
import { NamespaceService } from 'src/namespace';

import { AppModule } from '../src/app.module';

const scope = 'test';
const phone = '12345678910';
const email = 'test@test.com';
const password = 'Test_password1234';

describe('user password workflow (e2e)', () => {
  let app: INestApplication;
  let namespaceService: NamespaceService;
  let captchaService: CaptchaService;
  let mongod: MongoMemoryServer;

  settings.captcha.fake = true; // 不进行短信及邮件的实际发送

  // const mongoUrl = `${settings.mongo.test}/password-e2e`;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new MongoErrorsInterceptor());
    await app.init();

    namespaceService = moduleFixture.get<NamespaceService>(NamespaceService);
    captchaService = moduleFixture.get<CaptchaService>(CaptchaService);

    await namespaceService.create({
      name: faker.company.name(),
      key: scope,
      registerDefaultRoles: ['mock'],
    });
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  // 用手机号注册，并设置密码，然后用密码登录
  it('register by phone with password, login', async () => {
    // 获取手机验证码
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.REGISTER, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.REGISTER,
    });
    expect(captcha.key).toBe('+55' + phone);
    expect(captcha.purpose).toBe(CaptchaPurpose.REGISTER);
    expect(captcha.dialingPrefix).toBe('+55');

    // 注册，并设置密码
    const registerResp = await request(app.getHttpServer())
      .post('/me/@registerByPhone')
      .send({ phone, code: captcha.code, dialingPrefix: '+55', scope, password })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const session = registerResp.body;
    expect(session.user.hasPassword).toBe(true);

    // 使用账号密码登录
    const loginResp = await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope,
        login: '+55-' + phone,
        password,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(loginResp.body.user.hasPassword).toBe(true);
  });

  // 用手机号注册带密码，修改密码时不填入原密码，应该失败
  it('register by phone with password, reset password fail', async () => {
    // 获取手机验证码
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.REGISTER, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.REGISTER,
    });
    expect(captcha.key).toBe('+55' + phone);
    expect(captcha.purpose).toBe(CaptchaPurpose.REGISTER);
    expect(captcha.dialingPrefix).toBe('+55');

    // 注册，并设置密码
    const sessionResp = await request(app.getHttpServer())
      .post('/me/@registerByPhone')
      .send({ phone, code: captcha.code, dialingPrefix: '+55', scope, password })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const session = sessionResp.body;
    expect(session.user.hasPassword).toBe(true);

    const token = sessionResp.body.token;

    // 设置密码, 不设置原密码
    await request(app.getHttpServer())
      .patch('/me/password')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        newPassword: password,
      })
      .expect(403);

    // 设置密码，错误密码
    await request(app.getHttpServer())
      .patch('/me/password')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        newPassword: password,
        oldPassword: 'wrong_password',
      })
      .expect(403);
  });

  // 用手机号注册，不设置密码，修改密码，用密码登录
  it('register by phone without password, reset password, login', async () => {
    // 获取手机验证码
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.REGISTER, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.REGISTER,
    });
    expect(captcha.key).toBe('+55' + phone);
    expect(captcha.purpose).toBe(CaptchaPurpose.REGISTER);
    expect(captcha.dialingPrefix).toBe('+55');

    // 注册，不设置密码
    const sessionResp = await request(app.getHttpServer())
      .post('/me/@registerByPhone')
      .send({ phone, code: captcha.code, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const token = sessionResp.body.token;

    // 设置密码
    const resetPasswordResp = await request(app.getHttpServer())
      .patch('/me/password')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        newPassword: password,
      });

    expect(resetPasswordResp.statusCode).toBe(200);
    expect(resetPasswordResp.body.hasPassword).toBe(true);

    // 使用账号密码登录
    const loginResp = await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope,
        login: '+55-' + phone,
        password,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(loginResp.body.user.hasPassword).toBe(true);
  });

  it('register by email with password, login', async () => {
    // 获取邮箱验证码
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaByEmail')
      .send({ email, purpose: CaptchaPurpose.REGISTER, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey(email, scope, {
      purpose: CaptchaPurpose.REGISTER,
    });
    expect(captcha.key).toBe(email);
    expect(captcha.purpose).toBe(CaptchaPurpose.REGISTER);

    // 注册, 并设置密码
    const registerResp = await request(app.getHttpServer())
      .post('/me/@registerByEmail')
      .send({ email, code: captcha.code, scope, password })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const session = registerResp.body;
    expect(session.user.hasPassword).toBe(true);

    // 使用账号密码登录
    const loginResp = await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope,
        login: email,
        password,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(loginResp.body.user.hasPassword).toBe(true);
  });
});
