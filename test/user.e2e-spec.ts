import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { JwtPayload } from 'src/auth';
import { Role } from 'src/common';
import { MongoErrorsInterceptor } from 'src/mongo';
import { NamespaceService } from 'src/namespace';
import { UserService } from 'src/user';

import { AppModule } from '../src/app.module';

describe('User crud (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let namespaceService: NamespaceService;
  let userService: UserService;
  let jwtService: JwtService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/user-e2e`;

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
    jwtService = moduleFixture.get<JwtService>(JwtService);

    userService = moduleFixture.get<UserService>(UserService);
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

  it(`Create user`, async () => {
    // ns 不存在
    await request(app.getHttpServer())
      .post('/users')
      .send({
        password: '^tR123456',
        username: 'kitty',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(404);

    await namespaceService.create({
      name: faker.company.name(),
      key: 'a',
    });
    await namespaceService.create({ name: faker.company.name(), key: 'b', parent: 'a' });

    // password 不合法
    await request(app.getHttpServer())
      .post('/users')
      .send({
        password: 'a1234abcd',
        username: 'kitty',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    await namespaceService.upsert({
      name: faker.company.name(),
      key: 'a',
      passwordRegExp: '^[a-zA-Z][a-zA-Z0-9]{8,64}$',
    });

    // ns 存在 且 password 合法
    const userResp = await request(app.getHttpServer())
      .post('/users')
      .send({
        password: 'a1234abcd',
        username: 'kitty',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    const user = userResp.body;
    expect(user.ns).toBe('a/b');

    // username 不合法
    await request(app.getHttpServer())
      .post('/users')
      .send({
        password: 'a1234abcd',
        username: '1',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
  });

  it(`Update user`, async () => {
    const user1 = await userService.upsert({ username: 'user1', ns: 'ns1' });

    // ns 不存在
    await request(app.getHttpServer())
      .patch(`/users/${user1.id}`)
      .send({
        password: '^tR123456',
        username: 'kitty',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(404);

    await namespaceService.create({ name: faker.company.name(), key: 'a' });
    await namespaceService.create({ name: faker.company.name(), key: 'b', parent: 'a' });

    // ns 存在
    const userResp = await request(app.getHttpServer())
      .patch(`/users/${user1.id}`)
      .send({
        password: '^tR123456',
        username: 'kitty',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
    const user = userResp.body;
    expect(user.ns).toBe('a/b');

    // 登录, 保证密码更新生效
    await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope: 'a',
        login: 'kitty',
        password: '^tR123456',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    // username 不合法
    await request(app.getHttpServer())
      .patch(`/users/${user1.id}`)
      .send({
        password: '^tR123456',
        username: '1a@22',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    // email 不合法
    await request(app.getHttpServer())
      .patch(`/users/${user1.id}`)
      .send({
        password: '^tR123456',
        email: '1a@22',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);

    await namespaceService.upsert({
      name: faker.company.name(),
      key: 'a',
      passwordRegExp: '^[a-zA-Z][a-zA-Z0-9]{8,64}$',
    });

    // password 不合法
    await request(app.getHttpServer())
      .patch(`/users/${user1.id}`)
      .send({
        password: '^tR123456',
        ns: 'a/b',
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
  });
});
