import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { AccessControlService } from 'src/access-control';
import { AppModule } from 'src/app.module';
import { UserService } from 'src/user';

describe('Access control (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let jwtService: JwtService;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/auth-access-control-e2e`;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    })
      .overrideProvider(AccessControlService)
      .useFactory({
        factory: () => {
          const accessControlService = new AccessControlService();
          jest.spyOn(accessControlService, 'loadAccessRouteMap').mockReturnValue({
            '*': 'sys:root,sys:service,auth:admin',
            '/users': 'auth:user_manager',
            '/namespaces/*': 'auth:ns_manager',
            '/me/*': '!user',
          });
          return accessControlService;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  it(`access control for public api`, async () => {
    const user = await userService.upsert({
      username: 'test-user',
      ns: 'test-ns',
      roles: [],
    });
    user.password = 'test123';
    await user.save();

    await request(app.getHttpServer())
      .post('/me/@login')
      .send({
        scope: 'test-ns',
        login: user.username,
        password: 'test123',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);
  });

  it(`access control for protected api`, async () => {
    // 认证失败
    await request(app.getHttpServer())
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(401);

    // super 用户
    await request(app.getHttpServer())
      .get('/sessions')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(
        'Authorization',
        `Bearer ${jwtService.sign({ super: true }, { expiresIn: '10s', subject: 'xxxx' })}`
      )
      .expect(200);

    // 无权限 (正向)
    await request(app.getHttpServer())
      .get('/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(
        'Authorization',
        `Bearer ${jwtService.sign({ roles: ['user'] }, { expiresIn: '10s', subject: 'xxxx' })}`
      )
      .expect(403);

    // 无权限 (反向)
    await request(app.getHttpServer())
      .get('/me/info')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(
        'Authorization',
        `Bearer ${jwtService.sign({ roles: ['user'] }, { expiresIn: '10s', subject: 'xxxx' })}`
      )
      .expect(403);
  });
});
