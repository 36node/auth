import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { UserService } from 'src/user';
import { User, UserSchema } from 'src/user/entities/user.entity';

import { CreateSessionDto } from './dto/create-session.dto';
import { Session, SessionSchema } from './entities/session.entity';
import { SessionService } from './session.service';

const mockSession = (uid: string): CreateSessionDto => ({
  refreshTokenExpireAt: dayjs().add(7, 'day').toDate(),
  uid,
});

describe('SessionService', () => {
  let sessionService: SessionService;
  let userService: UserService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let sessionModel: Model<Session>;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    sessionModel = mongoConnection.model<Session>(Session.name, SessionSchema);

    // 因为有 populate 所以需要在此处也声明 schema 供 mongodb-memory-server 使用
    userModel = mongoConnection.model<User>(User.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getModelToken(Session.name),
          useValue: sessionModel,
        },
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    sessionService = module.get<SessionService>(SessionService);
    userService = module.get<UserService>(UserService);
    await userModel.syncIndexes();
    await sessionModel.syncIndexes();
  });

  it('should be defined', () => {
    expect(sessionService).toBeDefined();
  });

  afterAll(async () => {
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createSession', () => {
    it('should create a session', async () => {
      const user = await userService.create({ ns: '1234' });
      const toBeCreated = mockSession(user.id);
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();
      expect(session.uid).toBe(user.id);
    });
  });

  describe('getSession', () => {
    it('should get a session', async () => {
      const user = await userService.create({ ns: '1234' });
      const toBeCreated = mockSession(user.id);
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      const found = await sessionService.get(session.id);
      expect(found).toBeDefined();
      expect(session.uid).toBe(user.id);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const user = await userService.create({ ns: '1234' });
      const toBeCreated = mockSession(user.id);
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      await sessionService.delete(session.id);
      const found = await sessionService.get(session.id);
      expect(found).toEqual(null);
    });
  });

  describe('listSession', () => {
    it('should list sessions', async () => {
      const user = await userService.create({ ns: '1234' });
      const toBeCreated1 = mockSession(user.id);
      const toBeCreated2 = mockSession(user.id);
      const toBeCreated3 = mockSession(user.id);
      await sessionService.create(toBeCreated1);
      await sessionService.create(toBeCreated2);
      await sessionService.create(toBeCreated3);
      const sessions = await sessionService.list({});
      expect(sessions).toBeDefined();
      expect(sessions).toHaveLength(3);
    });
  });

  describe('countSession', () => {
    it('should count sessions', async () => {
      const user = await userService.create({ ns: '1234' });
      const toBeCreated1 = mockSession(user.id);
      const toBeCreated2 = mockSession(user.id);
      const toBeCreated3 = mockSession(user.id);
      await sessionService.create(toBeCreated1);
      await sessionService.create(toBeCreated2);
      await sessionService.create(toBeCreated3);
      const count = await sessionService.count({});
      expect(count).toBeDefined();
      expect(count).toBe(3);
    });
  });

  describe('updateSession', () => {
    it('should update a session', async () => {
      const user = await userService.create({ ns: '1234' });
      const toBeCreated = mockSession(user.id);
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      const updateDoc = { refreshTokenExpireAt: dayjs().add(1, 'day').toDate() };
      const updated = await sessionService.update(session.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated.refreshTokenExpireAt).toEqual(updateDoc.refreshTokenExpireAt);
    });
  });

  describe('findByKey', () => {
    it('should find a session by key', async () => {
      const user = await userService.create({ ns: '1234' });
      const toBeCreated = mockSession(user.id);
      const session = await sessionService.create(toBeCreated);
      expect(session).toBeDefined();

      const found = await sessionService.findByRefreshToken(session.refreshToken);
      expect(found).toBeDefined();
      expect(found.refreshToken).toBe(session.refreshToken);
    });
  });
});
