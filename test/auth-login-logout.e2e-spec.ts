import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { SessionWithToken } from 'src/auth';
import { NamespaceService } from 'src/namespace';
import { UserService } from 'src/user';

import { AppModule } from '../src/app.module';

const mockUser = () => {
  return {
    phone: faker.phone.number(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: '23@3eFwee',
    key: faker.string.alphanumeric(6),
    code: faker.string.alphanumeric(6),
    ns: 'test-ns',
  };
};

describe('Web auth (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let namespaceService: NamespaceService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/auth-login-logout-e2e`;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    namespaceService = moduleFixture.get<NamespaceService>(NamespaceService);

    // 准备一个初始化 namespace
    await namespaceService.create({
      name: faker.company.name(),
      key: 'test-ns',
    });
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('Register user by username and password', async () => {
    const userDoc = mockUser();
    const registerResp = await request(app.getHttpServer())
      .post('/auth/@register')
      .send(userDoc)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const user = registerResp.body;
    expect(user.username).toBe(userDoc.username);
  });

  it(`Login failed without register`, async () => {
    await request(app.getHttpServer())
      .post('/auth/@login')
      .send({
        login: 'username',
        password: 'password',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);
  });

  it(`login success`, async () => {
    const userDoc = mockUser();
    await userService.create(userDoc);

    // 登录成功
    const sessionResp = await request(app.getHttpServer())
      .post('/auth/@login')
      .send({
        login: userDoc.username,
        password: userDoc.password,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const session: SessionWithToken = sessionResp.body;
    expect(sessionResp.statusCode).toBe(201);
    expect(session).toBeDefined();
    expect(session.user.username).toBe(userDoc.username);

    // 刷新token
    const refreshTokenResp = await request(app.getHttpServer())
      .post('/auth/@refresh')
      .send({ key: session.key })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const sessionWithToken: SessionWithToken = refreshTokenResp.body;
    expect(sessionWithToken).toBeDefined();

    // 快过期的 session 会自动轮换
    const RealDate = Date.now;
    global.Date.now = jest.fn(() => new Date(session.expireAt).getTime() - 100 * 1000);
    const shouldRotateRes = await request(app.getHttpServer())
      .post('/auth/@refresh')
      .send({ key: session.key })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(shouldRotateRes.statusCode).toBe(201);
    const rotateSession: SessionWithToken = shouldRotateRes.body;
    expect(rotateSession).toBeDefined();
    expect(rotateSession.key).not.toBe(session.key);
    global.Date.now = RealDate;

    // 已过期的 session 不能 refresh
    global.Date.now = jest.fn(() => new Date(session.expireAt).getTime() + 100 * 1000);
    const expiredRes = await request(app.getHttpServer())
      .post('/auth/@refresh')
      .send({ key: session.key })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(expiredRes.statusCode).toBe(401);
    global.Date.now = RealDate;

    // 退出登录
    await request(app.getHttpServer())
      .delete(`/sessions/${session.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(204);

    // 刷新token失败
    await request(app.getHttpServer())
      .post('/auth/@refresh')
      .send({ key: session.key })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);
  });
});
