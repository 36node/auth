import { faker } from '@faker-js/faker/locale/af_ZA';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';

import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { Namespace, NamespaceSchema } from './entities/namespace.entity';
import { NamespaceService } from './namespace.service';

const mockNamespace = (ns: string, parent?: string): CreateNamespaceDto => ({
  key: ns,
  name: 'Test',
  parent,
});

describe('NamespaceService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let service: NamespaceService;
  let namespaceModel: Model<Namespace>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    namespaceModel = mongoConnection.model<Namespace>(Namespace.name, NamespaceSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NamespaceService,
        {
          provide: getModelToken(Namespace.name),
          useValue: namespaceModel,
        },
      ],
    }).compile();

    service = module.get<NamespaceService>(NamespaceService);
    await namespaceModel.syncIndexes();
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

  describe('createNamespace', () => {
    it('should create a namespace', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      expect(namespace).toBeDefined();
      expect(namespace).toMatchObject(toBeCreated);

      await expect(service.create(toBeCreated)).rejects.toThrowError();

      await expect(service.create({ ...toBeCreated, parent: 'xxxx' })).resolves.toBeDefined();
    });
  });

  describe('getNamespace', () => {
    it('should get a namespace by id', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      expect(namespace).toBeDefined();

      const foundByNs = await service.get(namespace.id);
      expect(foundByNs).toBeDefined();
      expect(foundByNs).toMatchObject(toBeCreated);
    });

    it('should get a namespace by ns', async () => {
      const namespace1 = await service.create(mockNamespace('nn-1'));
      const namespace2 = await service.create(mockNamespace('nn-2'));
      const namespace3 = await service.create(mockNamespace('nn-2', 'nn-1'));

      const found1 = await service.get('nn-1');
      expect(found1.id).toBe(namespace1.id);

      const found2 = await service.get('nn-2');
      expect(found2.id).toBe(namespace2.id);

      const found3 = await service.get('nn-1/nn-2');
      expect(found3.id).toBe(namespace3.id);
    });
  });

  describe('deleteNamespace', () => {
    it('should delete a namespace', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      expect(namespace).toBeDefined();

      await service.delete(namespace.id);
      const found = await service.get(namespace.key);
      expect(found).toEqual(null);
    });
  });

  describe('listNamespace', () => {
    it('should list namespaces', async () => {
      await service.create(mockNamespace('n-1'));
      await service.create(mockNamespace('n-2'));
      await service.create(mockNamespace('n-3'));
      const namespaces = await service.list({});
      expect(namespaces).toBeDefined();
      expect(namespaces).toHaveLength(3);
    });
  });

  describe('countNamespace', () => {
    it('should count namespaces', async () => {
      await service.create(mockNamespace('n-1'));
      const count = await service.count({});
      expect(count).toBe(1);
    });
  });

  describe('updateNamespace', () => {
    it('should update a namespace', async () => {
      const toBeCreated = mockNamespace('n-1');
      const namespace = await service.create(toBeCreated);
      const updateDoc = { name: 'updated name' };
      const updated = await service.update(namespace.id, updateDoc);
      expect(updated).toBeDefined();
      expect(updated).toMatchObject(updateDoc);
    });
  });

  describe('upsertNamespace', () => {
    it('should upsert a namespace', async () => {
      const toBeUpserted = mockNamespace('n-1');
      const namespace = await service.upsert(toBeUpserted);
      expect(namespace).toBeDefined();
      expect(namespace).toMatchObject(toBeUpserted);
    });
  });

  describe('getByFullPath', () => {
    it('should get a namespace by full path', async () => {
      const ns1 = await service.create({
        name: faker.company.name(),
        key: 'a',
      });
      expect((await service.getByFullPath('a')).id).toBe(ns1.id);

      const ns2 = await service.create({
        name: faker.company.name(),
        key: 'a',
        parent: 'b',
      });
      expect((await service.getByFullPath('b/a')).id).toBe(ns2.id);

      const ns3 = await service.create({
        name: faker.company.name(),
        key: 'a',
        parent: 'c/b',
      });
      expect((await service.getByFullPath('c/b/a')).id).toBe(ns3.id);

      expect(await service.getByFullPath('a/b')).toBeNull();
    });
  });
});
