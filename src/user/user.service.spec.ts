import { faker } from '@faker-js/faker';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { User, UserSchema } from './entities/user.entity';
import { UserService } from './user.service';

const mockUser = () => ({
  email: faker.internet.email(),
  password: '123456',
  username: faker.internet.userName(),
  ns: 'n1',
});

describe('UserService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userService: UserService;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model<User>(User.name, UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    await userModel.syncIndexes();
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

  describe('createUser', () => {
    it('should create a user', async () => {
      const userDoc = mockUser();
      const user = await userService.create(userDoc);
      expect(user).toBeDefined();
      expect(userService.checkPassword(user.password, userDoc.password)).toBeTruthy();
    });

    it('should validate index', async () => {
      await expect(userService.create({ username: 'kitty' })).resolves.toBeDefined();
      await expect(userService.create({ username: 'kitty' })).rejects.toThrowError();
      await expect(userService.create({ phone: '18888888888' })).resolves.toBeDefined();
      await expect(userService.create({ phone: '18888888888' })).rejects.toThrowError();
      await expect(userService.create({ email: 'aaa@test.com' })).resolves.toBeDefined();
      await expect(userService.create({ email: 'aaa@test.com' })).rejects.toThrowError();
    });
  });

  describe('findByLogin', () => {
    it('should find a user by login', async () => {
      const userDoc = mockUser();
      const user = await userService.create(userDoc);
      const found = await userService.findByLogin(user.username);
      expect(found).toBeDefined();

      const { password, ...rest } = userDoc;
      expect(found).toMatchObject(rest);
      expect(userService.checkPassword(found.password, password)).toBeTruthy();
    });
  });

  describe('countUser', () => {
    it('should count users', async () => {
      await userService.create(mockUser());
      const count = await userService.count({});
      expect(count).toBe(1);
    });
  });

  describe('listUser', () => {
    it('should list users', async () => {
      await userService.create(mockUser());
      const users = await userService.list({});
      expect(users).toBeDefined();
      expect(users).toHaveLength(1);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = await userService.create(mockUser());
      const updateDoc = { intro: 'updated intro' };
      const updated = await userService.update(user.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const user = await userService.create(mockUser());
      await userService.delete(user.id);
      const found = await userService.get(user.id);
      expect(found).toEqual(null);
    });
  });

  describe('getUser', () => {
    it('should get a user', async () => {
      const user = await userService.create(mockUser());
      const found = await userService.get(user.id);
      expect(found).toBeDefined();
    });
  });

  describe('upsertUser', () => {
    it('should upsert a user', async () => {
      const userDoc = mockUser();
      const user = await userService.upsertByPhone('18888888888', userDoc);
      expect(user.email).toBe(userDoc.email);
    });
  });
});
