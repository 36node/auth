import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import request from 'supertest';

import { MongoErrorsInterceptor } from 'src/mongo';
import { Namespace, NamespaceDocument, NamespaceService } from 'src/namespace';

import { AppModule } from '../src/app.module';

describe('Namespace crud (e2e)', () => {
  let app: INestApplication;
  let namespaceService: NamespaceService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/namesapce-e2e`;

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

    // ensure index is created
    const NamespaceModel = moduleFixture.get<Model<NamespaceDocument>>(
      getModelToken(Namespace.name)
    );
    await NamespaceModel.ensureIndexes();
  });

  afterAll(async () => {
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
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // parent 不存在
    await request(app.getHttpServer())
      .post('/namespaces')
      .send({
        name: faker.company.name(),
        key: 'pal',
        ns: 'haivivi.com2/pal1',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(404);
  });

  it(`List namespaces`, async () => {
    await namespaceService.create({ name: faker.company.name(), key: 'n1' });
    await namespaceService.create({ name: faker.company.name(), key: 'n2' });
    await namespaceService.create({ name: faker.company.name(), key: 'aaaa', ns: 'n1' });
    await namespaceService.create({ name: faker.company.name(), key: 'bbbb', ns: 'n1' });
    await namespaceService.create({ name: faker.company.name(), key: 'cccc', ns: 'n2' });

    // 未使用 ns 参数
    const resp1 = await request(app.getHttpServer())
      .get(`/namespaces`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    expect(resp1.body.length).toBeGreaterThanOrEqual(5); // 包含初始化的 namespace

    // 使用 ns 参数
    const resp2 = await request(app.getHttpServer())
      .get(`/namespaces?ns=n1`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    expect(resp2.body).toHaveLength(2);

    // 使用 ns_start 参数
    const resp3 = await request(app.getHttpServer())
      .get(`/namespaces?ns_start=n`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    expect(resp3.body).toHaveLength(3);
  });

  it(`get namespace`, async () => {
    const ns1 = await namespaceService.create({ name: faker.company.name(), key: 'aaa' });
    const ns2 = await namespaceService.create({
      name: faker.company.name(),
      key: 'aaa/bbb',
      ns: 'aaa',
    });

    const resp1 = await request(app.getHttpServer())
      .get(`/namespaces/${encodeURIComponent(ns1.id)}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    const founded1 = resp1.body;
    expect(founded1).toBeDefined();
    expect(founded1.id).toBe(ns1.id);

    const resp2 = await request(app.getHttpServer())
      .get(`/namespaces/${encodeURIComponent('aaa/bbb')}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    const founded = resp2.body;
    expect(founded).toBeDefined();
    expect(founded.id).toBe(ns2.id);
  });

  it(`Update namesapce`, async () => {
    const ns = await namespaceService.create({
      name: faker.company.name(),
      key: faker.string.alpha(6),
    });
    const nameToBeUpdated = 'test name';

    const resp = await request(app.getHttpServer())
      .patch(`/namespaces/${ns.id}`)
      .send({
        name: nameToBeUpdated,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    const updated = resp.body;
    expect(updated).toBeDefined();
    expect(updated.id).toBe(ns.id);
    expect(updated.name).toBe(nameToBeUpdated);
  });

  it(`Delete namespace`, async () => {
    const ns = await namespaceService.create({
      name: faker.company.name(),
      key: faker.string.alpha(6),
    });

    await request(app.getHttpServer())
      .delete(`/namespaces/${ns.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(204);
    expect(await namespaceService.get(ns.id)).toBeNull();
  });
});
