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
const email = 'test@test.com';

describe('update phone and email (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let captchaService: CaptchaService;
  let user: UserDocument;
  let namespaceService: NamespaceService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/update-phone-email`;

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

    user = await userService.upsert({
      username: username,
      ns: scope,
      roles: [Role.AUTH_MANAGER],
    });
    user.password = 'test123';

    await user.save();
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  it(`update phone and email`, async () => {
    // 登录成功
    const sessionResp = await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope: scope,
        login: user.username,
        password: 'test123',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const session: SessionWithToken = sessionResp.body;
    expect(sessionResp.statusCode).toBe(200);
    expect(session).toBeDefined();

    await namespaceService.create({
      name: faker.company.name(),
      key: scope,
    });

    // 获取手机验证码
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.UPDATE_PHONE, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.UPDATE_PHONE,
    });
    expect(captcha.key).toBe('+55' + phone);
    expect(captcha.purpose).toBe(CaptchaPurpose.UPDATE_PHONE);

    // 通过手机号、验证码更新手机号
    const updatedPhone = await request(app.getHttpServer())
      .patch('/me/phone')
      .send({ code: captcha.code, phone, dialingPrefix: '+55', scope })
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(updatedPhone.statusCode).toBe(200);
    expect(updatedPhone.body.phone).toBe(phone);

    // 通过更新后的手机号重新登录
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaBySms')
      .send({ phone, purpose: CaptchaPurpose.LOGIN, dialingPrefix: '+55', scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha2 = await captchaService.getByKey('+55' + phone, scope, {
      purpose: CaptchaPurpose.LOGIN,
    });

    const loginByPhoneResp = await request(app.getHttpServer())
      .post('/me/@loginByPhone')
      .send({ code: captcha2.code, phone, scope, dialingPrefix: '+55' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    expect(loginByPhoneResp.statusCode).toBe(200);
    expect(loginByPhoneResp).toBeDefined();

    // 获取email验证码
    const loginByPhone = loginByPhoneResp.body;
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaByEmail')
      .send({ email, purpose: CaptchaPurpose.UPDATE_EMAIL, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha3 = await captchaService.getByKey(email, scope, {
      purpose: CaptchaPurpose.UPDATE_EMAIL,
    });
    expect(captcha3.key).toBe(email);
    expect(captcha3.purpose).toBe(CaptchaPurpose.UPDATE_EMAIL);

    // 通过email、验证码更新手机号
    const updatedEmail = await request(app.getHttpServer())
      .patch('/me/email')
      .send({ code: captcha3.code, email, scope })
      .set('Authorization', `Bearer ${loginByPhone.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(updatedEmail.statusCode).toBe(200);
    expect(updatedEmail.body.email).toBe(email);

    // 通过更新后的email重新登录
    await request(app.getHttpServer())
      .post('/captchas/@createCaptchaByEmail')
      .send({ email, purpose: CaptchaPurpose.LOGIN, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const captcha4 = await captchaService.getByKey(email, scope, {
      purpose: CaptchaPurpose.LOGIN,
    });
    const loginByEmailResp = await request(app.getHttpServer())
      .post('/me/@loginByEmail')
      .send({ code: captcha4.code, email, scope })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(loginByEmailResp.statusCode).toBe(200);
    expect(loginByEmailResp).toBeDefined();

    // 退出登录
    const loginByEmail = loginByEmailResp.body;
    await request(app.getHttpServer())
      .post(`/me/@logout`)
      .send({ key: loginByEmail.subject })
      .set('Authorization', `Bearer ${loginByEmail.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
  });
});
