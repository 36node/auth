import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import request from 'supertest';

import { JwtPayload } from 'src/auth';
import { Role } from 'src/common';
import { MongoErrorsInterceptor } from 'src/mongo';
import { Namespace, NamespaceDocument, NamespaceService } from 'src/namespace';
import { UserService } from 'src/user';

import { AppModule } from '../src/app.module';

describe('Namespace crud (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let jwtService: JwtService;
  let namespaceService: NamespaceService;
  let token: string;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/namesapce-e2e`;

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

    userService = moduleFixture.get<UserService>(UserService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    namespaceService = moduleFixture.get<NamespaceService>(NamespaceService);

    // ensure index is created
    const NamespaceModel = moduleFixture.get<Model<NamespaceDocument>>(
      getModelToken(Namespace.name)
    );
    await NamespaceModel.ensureIndexes();

    const user = await userService.upsert({ username: 'xxxxx', ns: 'xxx' });
    const jwtpayload: JwtPayload = {
      roles: [Role.ADMIN],
      ns: '',
    };
    token = jwtService.sign(jwtpayload, { expiresIn: '10s', subject: user.id });
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  it(`Create namespace`, async () => {
    // 无效的 ns
    const invalidNs = ['123', 'a12/cc', 'abab.ababababababababababababababababababab'];
    await request(app.getHttpServer())
      .post('/namespaces')
      .send({
        name: faker.company.name(),
        ns: faker.helpers.arrayElement(invalidNs),
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // 无效的 密码正则校验
    await request(app.getHttpServer())
      .post('/namespaces')
      .send({
        name: faker.company.name(),
        key: 'haivivi.com1',
        passwordRegExp: '^[a-zA-Z][a-zA-Z0-9._-/]{2,29}$', // 正确的应该是 ^[a-zA-Z][a-zA-Z0-9._/-]{2,29}$
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // 顶层 ns
    const scopeNsResp = await request(app.getHttpServer())
      .post('/namespaces')
      .send({
        name: faker.company.name(),
        key: 'haivivi.com1',
        registerDefaultRoles: ['biz:user'],
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const scopeNs = scopeNsResp.body;
    expect(scopeNs.registerDefaultRoles).toStrictEqual(['biz:user']);
    expect(scopeNs.isScope).toBeTruthy();

    // 非顶层 ns
    const nsResp = await request(app.getHttpServer())
      .post('/namespaces')
      .send({
        name: faker.company.name(),
        key: 'pal',
        parent: 'haivivi.com1',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const ns = nsResp.body;
    expect(ns.isScope).toBeFalsy();

    // parent 和 ns 重复
    await request(app.getHttpServer())
      .post('/namespaces')
      .send({
        name: faker.company.name(),
        key: 'pal',
        parent: 'haivivi.com1',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(409);

    // parent 不存在
    await request(app.getHttpServer())
      .post('/namespaces')
      .send({
        name: faker.company.name(),
        key: 'pal',
        parent: 'haivivi.com2/pal1',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(404);
  });

  it(`List namespaces`, async () => {
    await namespaceService.create({ name: faker.company.name(), key: 'aaa' });
    await namespaceService.create({ name: faker.company.name(), key: 'bbb', parent: 'aaa' });
    await namespaceService.create({ name: faker.company.name(), key: 'ccc', parent: 'aaa/bbb' });

    // 未使用 parent_scope 参数
    const jwtPayload1: JwtPayload = {
      roles: [Role.NS_MANAGER],
      ns: 'aaa',
    };
    const resp1 = await request(app.getHttpServer())
      .get(`/namespaces`)
      .set(
        'Authorization',
        `Bearer ${jwtService.sign(jwtPayload1, {
          expiresIn: '10s',
          subject: new Types.ObjectId().toString(),
        })}`
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    expect(resp1.body.length).toBeGreaterThanOrEqual(4); // 包含初始化的 namespace

    // 使用 parent_scope 参数
    const jwtPayload2: JwtPayload = {
      roles: [Role.NS_MANAGER],
      ns: 'aaa',
    };
    const resp2 = await request(app.getHttpServer())
      .get(`/namespaces?parent_scope=aaa/bbb`)
      .set(
        'Authorization',
        `Bearer ${jwtService.sign(jwtPayload2, {
          expiresIn: '10s',
          subject: new Types.ObjectId().toString(),
        })}`
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    expect(resp2.body).toHaveLength(1);
  });

  it(`get namespace`, async () => {
    const ns1 = await namespaceService.create({ name: faker.company.name(), key: 'aaa' });
    const ns2 = await namespaceService.create({
      name: faker.company.name(),
      key: 'bbb',
      parent: 'aaa',
    });

    // ns 授权 (使用 ns 查询)
    const jwtPayload: JwtPayload = {
      roles: [Role.NS_MANAGER],
      ns: 'aaa/bbb',
    };
    const resp = await request(app.getHttpServer())
      .get(`/namespaces/${encodeURIComponent('aaa/bbb')}`)
      .set(
        'Authorization',
        `Bearer ${jwtService.sign(jwtPayload, {
          expiresIn: '10s',
          subject: new Types.ObjectId().toString(),
        })}`
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    const founded = resp.body;
    expect(founded).toBeDefined();
    expect(founded.id).toBe(ns2.id);

    // ns 授权 (使用 id 查询)
    const jwtPayload1: JwtPayload = {
      roles: [Role.NS_MANAGER],
      ns: 'aaa',
    };
    const resp1 = await request(app.getHttpServer())
      .get(`/namespaces/${encodeURIComponent(ns1.id)}`)
      .set(
        'Authorization',
        `Bearer ${jwtService.sign(jwtPayload1, {
          expiresIn: '10s',
          subject: new Types.ObjectId().toString(),
        })}`
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    const founded1 = resp1.body;
    expect(founded1).toBeDefined();
    expect(founded1.id).toBe(ns1.id);
  });

  it(`Update namesapce`, async () => {
    await namespaceService.create({ name: faker.company.name(), key: 'aaa' });
    const ns2 = await namespaceService.create({
      name: faker.company.name(),
      key: 'bbb',
      parent: 'aaa',
    });

    // ns 未受限
    const jwtPayload2: JwtPayload = {
      roles: [Role.NS_MANAGER],
      ns: 'aaa',
    };
    const resp2 = await request(app.getHttpServer())
      .patch(`/namespaces/${ns2.id}`)
      .send({
        name: 'test name',
      })
      .set(
        'Authorization',
        `Bearer ${jwtService.sign(jwtPayload2, {
          expiresIn: '10s',
          subject: new Types.ObjectId().toString(),
        })}`
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    const update2 = resp2.body;
    expect(update2).toBeDefined();
    expect(update2.id).toBe(ns2.id);
    expect(update2.name).toBe('test name');
  });

  it(`Delete namespace`, async () => {
    await namespaceService.create({ name: faker.company.name(), key: 'aaa' });
    const ns2 = await namespaceService.create({
      name: faker.company.name(),
      key: 'bbb',
      parent: 'aaa',
    });

    // 删除 namespace
    const jwtPayload2: JwtPayload = {
      roles: [Role.ADMIN],
      ns: 'aaa/bbb',
    };
    await request(app.getHttpServer())
      .delete(`/namespaces/${ns2.id}`)
      .set(
        'Authorization',
        `Bearer ${jwtService.sign(jwtPayload2, {
          expiresIn: '10s',
          subject: new Types.ObjectId().toString(),
        })}`
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(204);
    expect(await namespaceService.get(ns2.id)).toBeNull();
  });

  it(`List scopes`, async () => {
    await namespaceService.create({ name: faker.company.name(), key: 'aaa' });
    await namespaceService.create({ name: faker.company.name(), key: 'bbb', parent: 'aaa' });
    await namespaceService.create({ name: faker.company.name(), key: 'ccc', parent: 'aaa/bbb' });

    // 角色授权
    const jwtPayload2: JwtPayload = {
      roles: [Role.AUTH_MANAGER],
      ns: 'aaa',
    };
    const resp2 = await request(app.getHttpServer())
      .get(`/scopes`)
      .set(
        'Authorization',
        `Bearer ${jwtService.sign(jwtPayload2, {
          expiresIn: '10s',
          subject: new Types.ObjectId().toString(),
        })}`
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    expect(resp2.body.length).toBeGreaterThanOrEqual(2); // 包含初始化的 scope
  });
});
