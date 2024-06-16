import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import request from 'supertest';

import { CaptchaPurpose, CaptchaService } from 'src/captcha';
import { settings } from 'src/config';
import { MongoErrorsInterceptor } from 'src/mongo';
import { NamespaceService } from 'src/namespace';
import { SessionWithToken } from 'src/session';
import { UserService } from 'src/user';

import { AppModule } from '../src/app.module';

const scope = 'test';
const phone = '12345678910';
const email = 'test@test.com';

describe('Captcha workflow (e2e)', () => {
  let app: INestApplication;
  let namespaceService: NamespaceService;
  let captchaService: CaptchaService;
  let userService: UserService;
  let mongod: MongoMemoryServer;

  settings.captcha.fake = true; // 不进行短信及邮件的实际发送

  // const mongoUrl = `${settings.mongo.test}/captcha-e2e`;

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
    userService = moduleFixture.get<UserService>(UserService);
  });

  afterEach(async () => {
    await (app.get(getConnectionToken()) as Connection).db.dropDatabase();
    await app.close();
    await mongod.stop();
  });

  // 手机验证码流程
  // 获取手机验证码 -> 通过手机号、验证码注册用户 -> 通过手机号、验证码登录
  it(`Phone workflow by captcha`, async () => {
    settings.registerOnLogin = false;

    await namespaceService.create({
      name: faker.company.name(),
      key: scope,
      registerDefaultRoles: ['mock'],
    });

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
    expect(captcha.expireAt).toBeDefined();
    expect(captcha.scope).toBe(scope);

    // 通过手机号、验证码注册用户
    // 错误的验证码
    await request(app.getHttpServer())
      .post('/me/@registerByPhone')
      .send({ phone, code: '000000', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    await captchaService.update(captcha.id, { purpose: CaptchaPurpose.LOGIN });
    // 正确的验证码，但是验证码用途错误
    await request(app.getHttpServer())
      .post('/me/@registerByPhone')
      .send({ phone, code: captcha.code, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
    await captchaService.update(captcha.id, { purpose: CaptchaPurpose.REGISTER });

    // 错误的 scope
    await request(app.getHttpServer())
      .post('/me/@registerByPhone')
      .send({ phone, code: captcha.code, dialingPrefix: '+55', scope: 'error' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.REGISTER, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const captcha1 = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.REGISTER,
    });

    const userResp = await request(app.getHttpServer())
      .post('/me/@registerByPhone')
      .send({ phone, code: captcha1.code, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const sessionWithToken = userResp.body;
    const { user, token } = sessionWithToken;
    expect(user.phone).toBe(phone);
    expect(user.dialingPrefix).toBe('+55');
    expect(user.roles).toStrictEqual(['mock']);
    expect(token).toBeDefined();
    expect(user.hasPassword).toBe(false);

    // 此时验证码已失效
    expect(await captchaService.get(captcha1.id)).toBeNull();

    // 通过手机号、验证码登录
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.LOGIN, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha2 = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.LOGIN,
    });
    // 错误的手机号，测试 phone strategy，这里需要调整验证码的phone，使验证码能通过校验，且手机号的用户不存在
    await captchaService.update(captcha2.id, { key: '+5511111111111' });
    await request(app.getHttpServer())
      .post('/me/@loginByPhone')
      .send({ scope, phone: '11111111111', code: captcha2.code, dialingPrefix: '+55' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);
    // 此时验证码已失效
    expect(await captchaService.get(captcha2.id)).toBeNull();

    // 正确的验证码，错误的区号
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.LOGIN, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha4 = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.LOGIN,
    });
    await request(app.getHttpServer())
      .post('/me/@loginByPhone')
      .send({ scope, phone, code: captcha4.code, dialingPrefix: '+86' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // 正确登录
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.LOGIN, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha3 = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.LOGIN,
    });
    const sessionResp = await request(app.getHttpServer())
      .post('/me/@loginByPhone')
      .send({ scope, phone, code: captcha3.code, dialingPrefix: '+55' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    // 登录成功
    const session: SessionWithToken = sessionResp.body;
    expect(session).toBeDefined();
  });

  // 邮箱验证码流程
  // 获取邮箱验证码 -> 通过邮箱、验证码注册用户 -> 通过邮箱、验证码登录
  it(`Email workflow by captcha`, async () => {
    settings.registerOnLogin = false;

    await namespaceService.create({
      name: faker.company.name(),
      key: scope,
      registerDefaultRoles: ['mock'],
    });

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
    expect(captcha.expireAt).toBeDefined();
    expect(captcha.scope).toBe(scope);

    // 通过邮箱、验证码注册用户
    // 错误的验证码
    await request(app.getHttpServer())
      .post('/me/@registerByEmail')
      .send({ email, code: '000000', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    await captchaService.update(captcha.id, { purpose: CaptchaPurpose.LOGIN });
    // 正确的验证码，但是验证码用途错误
    await request(app.getHttpServer())
      .post('/me/@registerByEmail')
      .send({ email, code: captcha.code, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
    await captchaService.update(captcha.id, { purpose: CaptchaPurpose.REGISTER });

    // 错误的 scope
    await request(app.getHttpServer())
      .post('/me/@registerByEmail')
      .send({ email, code: captcha.code, scope: 'error' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    const captcha1 = await captchaService.upsertByKey(email, scope, {
      code: captchaService.generateCaptcha(6),
      purpose: CaptchaPurpose.REGISTER,
    });

    const userResp = await request(app.getHttpServer())
      .post('/me/@registerByEmail')
      .send({ email, code: captcha1.code, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const sessionWithToken = userResp.body;
    const { user, token } = sessionWithToken;
    expect(user.email).toBe(email);
    expect(user.roles).toStrictEqual(['mock']);
    expect(token).toBeDefined();
    expect(user.hasPassword).toBe(false);

    // 此时验证码已失效
    expect(await captchaService.get(captcha1.id)).toBeNull();

    // 通过邮箱、验证码登录
    const captcha2 = await captchaService.upsertByKey(email, scope, {
      code: captchaService.generateCaptcha(6),
      purpose: CaptchaPurpose.LOGIN,
    });
    // 错误的邮箱，测试 email strategy，这里需要调整验证码的email，使验证码能通过校验，且邮箱的用户不存在
    await captchaService.update(captcha2.id, { key: 'test1@test.com' });
    await request(app.getHttpServer())
      .post('/me/@loginByEmail')
      .send({ scope, email: 'test1@test.com', code: captcha2.code })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);
    // 此时验证码已失效
    expect(await captchaService.get(captcha2.id)).toBeNull();

    const captcha3 = await captchaService.upsertByKey(email, scope, {
      code: captchaService.generateCaptcha(6),
      purpose: CaptchaPurpose.LOGIN,
    });
    const sessionResp = await request(app.getHttpServer())
      .post('/me/@loginByEmail')
      .send({ scope, email, code: captcha3.code })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    // 登录成功
    const session: SessionWithToken = sessionResp.body;
    expect(session).toBeDefined();
    expect(session.user.hasPassword).toBe(false);
  });

  // 手机验证码流程
  // 获取手机验证码 -> 通过手机号、验证码免注册登录
  it(`Login by phone captcha without register`, async () => {
    settings.registerOnLogin = true;

    await namespaceService.create({ name: faker.company.name(), key: scope });

    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.LOGIN, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.LOGIN,
    });

    expect(await userService.list({ phone, dialingPrefix: '+55' })).toHaveLength(0);

    const sessionResp = await request(app.getHttpServer())
      .post('/me/@loginByPhone')
      .send({ scope, phone, code: captcha.code, dialingPrefix: '+55' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    // 登录成功
    const session: SessionWithToken = sessionResp.body;
    expect(session).toBeDefined();

    expect(await userService.list({ phone, dialingPrefix: '+55' })).toHaveLength(1);
  });

  // 邮箱验证码流程
  // 获取邮箱验证码 -> 通过邮箱、验证码免注册登录
  it(`Login by email captcha without register`, async () => {
    settings.registerOnLogin = true;

    await namespaceService.create({ name: faker.company.name(), key: scope });

    const captcha = await captchaService.upsertByKey(email, scope, {
      code: captchaService.generateCaptcha(6),
      purpose: CaptchaPurpose.LOGIN,
    });

    expect(await userService.list({ email })).toHaveLength(0);

    const sessionResp = await request(app.getHttpServer())
      .post('/me/@loginByEmail')
      .send({ scope, email, code: captcha.code })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    // 登录成功
    const session: SessionWithToken = sessionResp.body;
    expect(session).toBeDefined();
    expect(session.user.hasPassword).toBe(false);

    expect(await userService.list({ email })).toHaveLength(1);
  });
});
