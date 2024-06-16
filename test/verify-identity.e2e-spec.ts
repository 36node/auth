import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { JwtPayload } from 'src/auth';
import { errCodes, Role } from 'src/common';
import { MongoErrorsInterceptor } from 'src/mongo';
import { IdentityType, User, UserService } from 'src/user';

import { AppModule } from '../src/app.module';

describe('Verify Identity (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let jwtService: JwtService;
  let token: string;
  let user: User;
  let mongod: MongoMemoryServer;

  // const mongoUrl = `${settings.mongo.test}/verify-identity`;

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

    user = await userService.upsert({ username: 'xxxxx', ns: 'xxx' });
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

  it(`Verify identity success`, async () => {
    const name = '张三';
    const identity = '888888888888888888';
    const type = IdentityType.ID;

    const response = await request(app.getHttpServer())
      .post('/me/@verifyIdentity')
      .send({
        name,
        identity,
        type,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(response.body.name).toBe(name);
    expect(response.body.type).toBe(type);
    expect(response.body.verified).toBe(true);
    expect(response.body.verifyAt).toBeDefined();
  });

  it(`Verify identity duplicate`, async () => {
    const name = '张三';
    const identity = '888888888888888888';
    const type = IdentityType.ID;

    await userService.updateIdentity(user.id, {
      name,
      type,
    });

    const response = await request(app.getHttpServer())
      .post('/me/@verifyIdentity')
      .send({
        name,
        identity,
        type,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(409);

    expect(response.body.code).toBe(errCodes.IDENTITY_ALREADY_VERIFIED);
  });

  it(`Verify identity failed`, async () => {
    const name = '张三';
    const identity = '000000000000000000';
    const type = IdentityType.ID;

    const response = await request(app.getHttpServer())
      .post('/me/@verifyIdentity')
      .send({
        name,
        identity,
        type,
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400);
    expect(response.body.code).toBe(errCodes.IDENTITY_VERIFY_FAILED);
  });

  it(`Get info will response identity`, async () => {
    const name = '张三';
    const type = IdentityType.ID;

    await userService.updateIdentity(user.id, {
      name,
      type,
    });

    const response = await request(app.getHttpServer())
      .get('/me/info')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200);

    expect(response.body.identity.name).toBe(name);
  });
});
