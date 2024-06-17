import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { Role } from 'src/common';
import { NamespaceService } from 'src/namespace';
import { SessionWithToken } from 'src/session';
import { UserService } from 'src/user';
import { UserDocument } from 'src/user/entities/user.entity';

import { AppModule } from '../src/app.module';

describe('Web auth (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let user: UserDocument;
  let namespaceService: NamespaceService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/auth-login-logout-e2e`;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    namespaceService = moduleFixture.get<NamespaceService>(NamespaceService);

    user = await userService.upsert({
      username: 'test-user',
      ns: 'test-ns',
      roles: [Role.AUTH_MANAGER],
    });
    user.password = 'test123';
    await user.save();

    await namespaceService.create({
      name: faker.company.name(),
      key: 'test-ns',
      registerDefaultRoles: ['mock'],
    });
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  it('Register user by username and password', async () => {
    const registerResp = await request(app.getHttpServer())
      .post('/me/@register')
      .send({
        scope: 'test-ns',
        username: 'test-user2',
        password: 'Test_1234_Test2',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    const session = registerResp.body;

    expect(session.user.username).toBe('test-user2');
    expect(session.user.hasPassword).toBe(true);
  });

  it(`Login failed via local strategy`, async () => {
    await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope: 'test-ns',
        login: user.username,
        password: 'xxxx',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);

    await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope: '1111',
        login: user.username,
        password: 'test123',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);
  });

  it(`login success via local strategy`, async () => {
    // 访问受限资源失败
    let productListResp = await request(app.getHttpServer())
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(401);

    // 登录成功
    const sessionResp = await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope: 'test-ns',
        login: user.username,
        password: 'test123',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const session: SessionWithToken = sessionResp.body;
    expect(sessionResp.statusCode).toBe(200);
    expect(session).toBeDefined();
    expect(session.user.hasPassword).toBe(true);

    // 访问受限资源成功
    productListResp = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(200);

    // 刷新token
    let refreshTokenResp = await request(app.getHttpServer())
      .post('/me/@refresh')
      .send({ key: session.key })
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(refreshTokenResp.statusCode).toBe(200);
    const refreshToken: SessionWithToken = refreshTokenResp.body;
    expect(refreshToken).toBeDefined();

    // 新token访问受限资源成功
    productListResp = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${refreshToken.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(200);

    // 快过期的 session 会自动轮换
    const RealDate = Date.now;
    global.Date.now = jest.fn(() => new Date(session.expireAt).getTime() - 100 * 1000);
    const shouldRotateRes = await request(app.getHttpServer())
      .post('/me/@refresh')
      .send({ key: session.key })
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(shouldRotateRes.statusCode).toBe(200);
    const rotateSession: SessionWithToken = shouldRotateRes.body;
    expect(rotateSession).toBeDefined();
    expect(rotateSession.key).not.toBe(session.key);
    global.Date.now = RealDate;

    // 已过期的 session 不能 refresh
    global.Date.now = jest.fn(() => new Date(session.expireAt).getTime() + 100 * 1000);
    const expiredRes = await request(app.getHttpServer())
      .post('/me/@refresh')
      .send({ key: session.key })
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(expiredRes.statusCode).toBe(403);
    global.Date.now = RealDate;

    // 退出登录
    await request(app.getHttpServer())
      .delete(`/sessions/${session.id}`)
      .set('Authorization', `Bearer ${refreshToken.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(productListResp.statusCode).toBe(200);

    // 刷新token失败
    refreshTokenResp = await request(app.getHttpServer())
      .post('/me/@refresh')
      .send({ key: session.key })
      .set('Authorization', `Bearer ${session.token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    expect(refreshTokenResp.statusCode).toBe(404);
  });
});
