import { fakerZH_CN as faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { MongoErrorsInterceptor } from 'src/mongo';
import { NamespaceService } from 'src/namespace';
import { UserService } from 'src/user';

import { AppModule } from '../src/app.module';

const mockUser = () => {
  return {
    phone: '1888888' + faker.string.numeric(4),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: '23@3eFwee',
    key: faker.string.alphanumeric(6),
    code: faker.string.alphanumeric(6),
    ns: 'test-ns',
  };
};

describe('User crud (e2e)', () => {
  let app: INestApplication;
  let namespaceService: NamespaceService;
  let userService: UserService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/user-e2e`;

  beforeAll(async () => {
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
    userService = moduleFixture.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it(`Create user`, async () => {
    const userDoc = mockUser();

    // ns 不存在
    await request(app.getHttpServer())
      .post('/users')
      .send(userDoc)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(404);

    await namespaceService.create({
      name: faker.company.name(),
      key: userDoc.ns,
    });

    // password 不合法
    await request(app.getHttpServer())
      .post('/users')
      .send({ ...userDoc, password: '1234567' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // ns 存在 且 password 合法
    const userResp = await request(app.getHttpServer())
      .post('/users')
      .send(userDoc)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const user = userResp.body;
    expect(user.ns).toBe(userDoc.ns);

    // username 不合法
    await request(app.getHttpServer())
      .post('/users')
      .send({
        password: 'a1234abcd',
        username: '1',
        ns: 'a/b',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // email 不合法
    await request(app.getHttpServer())
      .post('/users')
      .send({
        password: 'a1234abcd',
        email: '11111',
        ns: 'a/b',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
  });

  it(`Update user`, async () => {
    const userDoc = mockUser();
    await namespaceService.upsertByKey(userDoc.ns, {
      name: faker.company.name(),
    });
    const user = await userService.create(userDoc);

    // ns 不存在
    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({
        ns: 'a/b',
        password: '^tR123456',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(404);

    // password 不合法
    await request(app.getHttpServer())
      .post(`/users/${user.id}/@updatePassword`)
      .send({
        oldPassword: userDoc.password,
        newPassword: '^123456',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // 密码修改成功
    await request(app.getHttpServer())
      .post(`/users/${user.id}/@updatePassword`)
      .send({
        oldPassword: userDoc.password,
        newPassword: '^tR123456',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(204);

    // 登录, 保证密码更新有效
    await request(app.getHttpServer())
      .post('/auth/@login')
      .send({
        login: userDoc.username,
        password: '^tR123456',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    // username 不合法
    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({
        username: '1a@22',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // email 不合法
    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({
        email: '1a@22',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
  });
});
