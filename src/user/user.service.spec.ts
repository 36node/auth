import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserSchema } from './entities/user.entity';
import { UserService } from './user.service';

const mockUser: CreateUserDto = {
  email: 'aaa@aa.com',
  password: '123456',
  username: 'kitty',
  ns: 'haivivi.com/pal',
};

describe('UserService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: UserService;
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

    service = module.get<UserService>(UserService);
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
      const user = await service.create(mockUser);
      expect(user).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(user).toMatchObject(rest);
      expect(user.checkPassword(password)).toBeTruthy();
    });

    it('should validate index', async () => {
      await expect(
        service.create({ username: 'kitty', ns: 'haivivi.com/pal' })
      ).resolves.toBeDefined();
      await expect(
        service.create({ username: 'kitty', ns: 'haivivi.com/pal' })
      ).rejects.toThrowError();
      await expect(
        service.create({ username: 'kitty', ns: 'haivivi.com1/pal' })
      ).resolves.toBeDefined();

      await expect(
        service.create({ phone: '18888888888', ns: 'haivivi.com/pal' })
      ).resolves.toBeDefined();
      await expect(
        service.create({ phone: '18888888888', ns: 'haivivi.com/pal' })
      ).rejects.toThrowError();
      await expect(
        service.create({ phone: '18888888888', ns: 'haivivi.com1/pal' })
      ).resolves.toBeDefined();

      await expect(
        service.create({ phone: '18888888888', dialingPrefix: '86', ns: 'haivivi.com/pal' })
      ).resolves.toBeDefined();
      await expect(
        service.create({ phone: '18888888888', dialingPrefix: '86', ns: 'haivivi.com/pal' })
      ).rejects.toThrowError();
      await expect(
        service.create({ phone: '18888888888', dialingPrefix: '86', ns: 'haivivi.com1/pal' })
      ).resolves.toBeDefined();

      // 同一个手机号，不同区号
      await expect(
        service.create({ phone: '18888888888', dialingPrefix: '99', ns: 'haivivi.com/pal' })
      ).resolves.toBeDefined();

      await expect(
        service.create({ email: 'aaa@test.com', ns: 'haivivi.com/pal' })
      ).resolves.toBeDefined();
      await expect(
        service.create({ email: 'aaa@test.com', ns: 'haivivi.com/pal' })
      ).rejects.toThrowError();
      await expect(
        service.create({ email: 'aaa@test.com', ns: 'haivivi.com1/pal' })
      ).resolves.toBeDefined();
    });
  });

  describe('findByLogin', () => {
    it('should find a user by login', async () => {
      const user = await service.create(mockUser);
      const found = await service.findByLogin(user.username);
      expect(found).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(found).toMatchObject(rest);
      expect(await found.checkPassword(password)).toBeFalsy();
    });
  });

  describe('findByLoginWithPassword', () => {
    it('should find a user by login', async () => {
      const user = await service.create(mockUser);
      const found = await service.findByLoginWithPassword(user.username, 'haivivi.com');

      expect(found).toBeDefined();
      expect(await found.checkPassword(mockUser.password)).toBeTruthy();
    });

    it('should find a user by phone login', async () => {
      await service.create({
        phone: '12345678901',
        ns: 'haivivi.com/pal',
        dialingPrefix: '+86',
        password: '123456',
      });

      // 错误scope
      let found = await service.findByLoginWithPassword('+86-12345678901', 'haivivi');

      expect(found).toBeNull();
      // 正确scope
      found = await service.findByLoginWithPassword('+86-12345678901', 'haivivi.com');
      expect(found).toBeDefined();
      expect(await found.checkPassword('123456')).toBeTruthy();
    });

    it('should find a user with same username and phone', async () => {
      await service.create({
        ns: 'haivivi.com/pal',
        password: '123456',
        phone: 'username',
        dialingPrefix: 'test',
      });

      const user = await service.create({
        username: 'test-username',
        password: '123456',
        ns: 'haivivi.com/pal',
      });

      //手机号定义成成用户名的样子，确保找到的是正确的用户名
      const found = await service.findByLoginWithPassword('test-username', 'haivivi.com');
      expect(found.id).toBe(user.id);
    });
  });

  describe('countUser', () => {
    it('should count users', async () => {
      await service.create(mockUser);
      const count = await service.count({});
      expect(count).toBe(1);
    });
  });

  describe('listUser', () => {
    it('should list users', async () => {
      await service.create(mockUser);
      const users = await service.list({});
      expect(users).toBeDefined();
      expect(users).toHaveLength(1);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = await service.create(mockUser);
      const updateDoc = { intro: 'updated intro' };
      const updated = await service.update(user.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const user = await service.create(mockUser);
      await service.delete(user.id);
      const found = await service.get(user.id);
      expect(found).toEqual(null);
    });
  });

  describe('getUser', () => {
    it('should get a user', async () => {
      const user = await service.create(mockUser);
      const found = await service.get(user.id);
      expect(found).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(found).toMatchObject(rest);
      expect(found.checkPassword(password)).toBeTruthy();
    });
  });

  describe('upsertUser', () => {
    it('should upsert a user', async () => {
      const user = await service.upsert(mockUser);
      expect(user).toBeDefined();

      const { password, ...rest } = mockUser;
      expect(user).toMatchObject(rest);
      expect(user.checkPassword(password)).toBeTruthy();
    });
  });
});
