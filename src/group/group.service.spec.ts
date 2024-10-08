import { faker } from '@faker-js/faker/locale/af_ZA';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CreateGroupDto } from './dto/create-group.dto';
import { Group, GroupSchema } from './entities/group.entity';
import { GroupService } from './group.service';

const mockGroup = (): CreateGroupDto => ({
  name: faker.company.name(),
});

describe('GroupService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: GroupService;
  let groupModel: Model<Group>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    groupModel = mongoConnection.model<Group>(Group.name, GroupSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getModelToken(Group.name),
          useValue: groupModel,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    await groupModel.syncIndexes();
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

  describe('createGroup', () => {
    it('should create a group', async () => {
      const toBeCreated = mockGroup();
      const group = await service.create(toBeCreated);
      expect(group).toBeDefined();
      expect(group).toMatchObject(toBeCreated);
    });
  });

  describe('getGroup', () => {
    it('should get a group by id', async () => {
      const toBeCreated = mockGroup();
      const group = await service.create(toBeCreated);
      expect(group).toBeDefined();

      const foundById = await service.get(group.id);
      expect(foundById).toBeDefined();
      expect(foundById).toMatchObject(toBeCreated);
    });

    it('should get a group by name', async () => {
      const group = await service.create(mockGroup());

      const found = await service.get(group.name);
      expect(found.id).toBe(group.id);
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group', async () => {
      const toBeCreated = mockGroup();
      const group = await service.create(toBeCreated);
      expect(group).toBeDefined();

      await service.delete(group.id);
      const found = await service.get(group.name);
      expect(found).toEqual(null);
    });
  });

  describe('listGroup', () => {
    it('should list groups', async () => {
      await service.create(mockGroup());
      await service.create(mockGroup());
      await service.create(mockGroup());
      const groups = await service.list();
      expect(groups).toBeDefined();
      expect(groups).toHaveLength(3);
    });
  });

  describe('countGroup', () => {
    it('should count group', async () => {
      await service.create(mockGroup());
      const count = await service.count();
      expect(count).toBe(1);
    });
  });

  describe('updateGroup', () => {
    it('should update a group', async () => {
      const toBeCreated = mockGroup();
      const group = await service.create(toBeCreated);
      const updateDoc = { name: 'updated name' };
      const updated = await service.update(group.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('upsertGroup', () => {
    it('should upsert a group', async () => {
      const toBeUpserted = mockGroup();
      const group = await service.upsertByName(toBeUpserted.name, toBeUpserted);
      expect(group).toBeDefined();
      expect(group).toMatchObject(toBeUpserted);
    });
  });
});
