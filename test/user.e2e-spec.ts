import { fakerZH_CN as faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { nanoid } from 'nanoid';
import request from 'supertest';

import { auth } from 'src/config';
import { ErrorCodes } from 'src/constants';
import { MongoErrorsInterceptor } from 'src/mongo';
import { NamespaceService } from 'src/namespace';
import { UserService } from 'src/user';

import { AppModule } from '../src/app.module';

import { mongoTestBaseUrl } from './config';

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

  const dbName = 'user-e2e';
  const mongoUrl = `${mongoTestBaseUrl}/${dbName}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUrl), AppModule],
    }).compile();

    // prepare database before module init hooks run
    const connection = moduleFixture.get<Connection>(getConnectionToken());
    await connection.db.dropDatabase({ dbName });

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new MongoErrorsInterceptor());
    await app.init();

    namespaceService = moduleFixture.get<NamespaceService>(NamespaceService);
    userService = moduleFixture.get<UserService>(UserService);
  });

  afterAll(async () => {
    // close app
    await app.close();
  });

  it(`Create user`, async () => {
    const userDoc = { ...mockUser(), ns: `test-ns-${nanoid(8)}` };

    // ns 不存在
    await request(app.getHttpServer())
      .post('/users')
      .send(userDoc)
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
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
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(400);

    // ns 存在 且 password 合法
    const userResp = await request(app.getHttpServer())
      .post('/users')
      .send(userDoc)
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(201);
    const user = userResp.body;
    expect(user.ns).toBe(userDoc.ns);
    expect(typeof user.id).toBe('string');

    // username 不合法
    await request(app.getHttpServer())
      .post('/users')
      .send({
        password: 'a1234abcd',
        username: '1',
        ns: 'a/b',
      })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
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
      .set('x-api-key', auth.apiKey)
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
      .set('x-api-key', auth.apiKey)
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
      .set('x-api-key', auth.apiKey)
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
      .set('x-api-key', auth.apiKey)
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
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(200);

    // username 不合法
    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({
        username: '1a@22',
      })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(400);

    // email 不合法
    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({
        email: '1a@22',
      })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(400);
  });

  it('Upsert user by id', async () => {
    const userId = `import-${nanoid(10)}`;
    const userDoc = mockUser();

    await namespaceService.upsertByKey(userDoc.ns, {
      name: faker.company.name(),
    });

    const createResp = await request(app.getHttpServer())
      .post('/users/@upsertUserById')
      .send({ ...userDoc, id: userId })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(201);

    expect(createResp.body.id).toBe(userId);

    const updateResp = await request(app.getHttpServer())
      .post('/users/@upsertUserById')
      .send({ ...userDoc, id: userId, intro: 'updated by id' })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(201);

    expect(updateResp.body.id).toBe(userId);
    expect(updateResp.body.intro).toBe('updated by id');
  });

  it('Should validate conflicts consistently across create and upsert endpoints', async () => {
    const ns = 'test-ns-conflict';
    await namespaceService.upsertByKey(ns, {
      name: faker.company.name(),
    });

    const baseA = {
      ...mockUser(),
      ns,
      employeeId: `emp-${nanoid(6)}`,
    };
    const baseB = {
      ...mockUser(),
      ns,
      employeeId: `emp-${nanoid(6)}`,
    };

    const userA = await userService.create(baseA);
    const userB = await userService.create(baseB);

    // create: explicit id conflict
    const createConflictResp = await request(app.getHttpServer())
      .post('/users')
      .send({ ...mockUser(), ns, id: userA.id })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(409);
    expect(createConflictResp.body.code).toBe(ErrorCodes.USER_ALREADY_EXISTS);

    // upsertByEmail: username conflict
    const upsertByEmailConflictResp = await request(app.getHttpServer())
      .post('/users/@upsertUserByEmail')
      .send({ ...mockUser(), ns, email: userA.email, username: userB.username })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(409);
    expect(upsertByEmailConflictResp.body.code).toBe(ErrorCodes.USER_ALREADY_EXISTS);

    // upsertByPhone: email conflict
    const upsertByPhoneConflictResp = await request(app.getHttpServer())
      .post('/users/@upsertUserByPhone')
      .send({ ...mockUser(), ns, phone: userA.phone, email: userB.email })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(409);
    expect(upsertByPhoneConflictResp.body.code).toBe(ErrorCodes.EMAIL_ALREADY_EXISTS);

    // upsertByEmployeeId: phone conflict
    const upsertByEmployeeIdConflictResp = await request(app.getHttpServer())
      .post('/users/@upsertUserByEmployeeId')
      .send({ ...mockUser(), ns, employeeId: baseA.employeeId, phone: userB.phone })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(409);
    expect(upsertByEmployeeIdConflictResp.body.code).toBe(ErrorCodes.PHONE_ALREADY_EXISTS);

    // upsertByUsername: employeeId conflict
    const upsertByUsernameConflictResp = await request(app.getHttpServer())
      .post('/users/@upsertUserByUsername')
      .send({ ...mockUser(), ns, username: userA.username, employeeId: baseB.employeeId })
      .set('Content-Type', 'application/json')
      .set('x-api-key', auth.apiKey)
      .set('Accept', 'application/json')
      .expect(409);
    expect(upsertByUsernameConflictResp.body.code).toBe(ErrorCodes.EMPLOYEE_ID_ALREADY_EXISTS);
  });
});
