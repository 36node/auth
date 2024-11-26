import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import request from 'supertest';

import { SessionWithToken } from 'src/auth';
import { CaptchaService, CreateCaptchaDto } from 'src/captcha';
import { MongoErrorsInterceptor } from 'src/mongo';

import { AppModule } from '../src/app.module';

import { mongoTestBaseUrl } from './config';

const phone = '18888888888';
const email = 'test@test.com';

describe('Captcha workflow (e2e)', () => {
  let app: INestApplication;
  let captchaService: CaptchaService;

  const mongoUrl = `${mongoTestBaseUrl}/captcha-e2e`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUrl), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new MongoErrorsInterceptor());
    await app.init();

    captchaService = moduleFixture.get<CaptchaService>(CaptchaService);
  });

  afterAll(async () => {
    // drop the database
    const connection = app.get<Connection>(getConnectionToken()); // 获取连接
    await connection.db.dropDatabase(); // 使用从 MongooseModule 中获得的连接删除数据库
    // close app
    await app.close();
  });

  // 手机验证码注册流程
  // 获取验证码 -> 通过手机号、验证码注册用户 -> 通过手机号、验证码登录
  it(`Phone register by captcha`, async () => {
    const captchaDoc: CreateCaptchaDto = {
      key: faker.string.alphanumeric(6),
      code: faker.string.alphanumeric(6),
    };
    // 获取手机验证码
    await request(app.getHttpServer())
      .post('/captchas')
      .send(captchaDoc)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    // 通过手机号、验证码注册用户
    // 错误的验证码
    await request(app.getHttpServer())
      .post('/auth/@registerByPhone')
      .send({ phone, code: '000000', key: '0000' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // 正确的验证码，但是 key 错误
    await request(app.getHttpServer())
      .post('/auth/@registerByPhone')
      .send({ phone, code: captchaDoc.code, key: '0000' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    const userResp = await request(app.getHttpServer())
      .post('/auth/@registerByPhone')
      .send({ phone, ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    const user = userResp.body;
    expect(user.phone).toBe(phone);

    // 此时验证码已被删除
    expect(await captchaService.getByKey(captchaDoc.key)).toBeNull();
  });

  // 通过手机号、验证码登录
  it(`Phone login by captcha`, async () => {
    const captchaDoc: CreateCaptchaDto = {
      key: faker.string.alphanumeric(6),
      code: faker.string.alphanumeric(6),
    };

    await request(app.getHttpServer())
      .post('/captchas')
      .send({ phone, ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    // 错误的手机号
    await request(app.getHttpServer())
      .post('/auth/@loginByPhone')
      .send({ phone: '11111111111', ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);

    // 正确登录
    const sessionResp = await request(app.getHttpServer())
      .post('/auth/@loginByPhone')
      .send({ phone, ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    // 登录成功
    const session: SessionWithToken = sessionResp.body;
    expect(session).toBeDefined();
  });

  // 邮箱验证码注册流程
  it(`Email register by captcha`, async () => {
    const captchaDoc: CreateCaptchaDto = {
      key: faker.string.alphanumeric(6),
      code: faker.string.alphanumeric(6),
    };
    // 获取验证码
    await request(app.getHttpServer())
      .post('/captchas')
      .send(captchaDoc)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    // 错误的验证码
    await request(app.getHttpServer())
      .post('/auth/@registerByEmail')
      .send({ email, code: '000000', key: '0000' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // 正确的验证码，但是 key 错误
    await request(app.getHttpServer())
      .post('/auth/@registerByEmail')
      .send({ email, code: captchaDoc.code, key: '0000' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    const userResp = await request(app.getHttpServer())
      .post('/auth/@registerByEmail')
      .send({ email, ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    const user = userResp.body;
    expect(user.email).toBe(email);

    // 此时验证码已被删除
    expect(await captchaService.getByKey(captchaDoc.key)).toBeNull();
  });

  // 通过邮箱、验证码登录
  it(`Email login by captcha`, async () => {
    const captchaDoc: CreateCaptchaDto = {
      key: faker.string.alphanumeric(6),
      code: faker.string.alphanumeric(6),
    };

    await request(app.getHttpServer())
      .post('/captchas')
      .send({ email, ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    // 错误的手机号
    await request(app.getHttpServer())
      .post('/auth/@loginByEmail')
      .send({ email: 'aa@36node.com', ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);

    // 正确登录
    const sessionResp = await request(app.getHttpServer())
      .post('/auth/@loginByEmail')
      .send({ email, ...captchaDoc })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    // 登录成功
    const session: SessionWithToken = sessionResp.body;
    expect(session).toBeDefined();
  });
});
