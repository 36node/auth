import * as fs from 'fs';

import { Test, TestingModule } from '@nestjs/testing';

import { AccessControlService } from './access-control.service';

describe('AccessControlService', () => {
  let service: AccessControlService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessControlService],
    }).compile();

    service = module.get<AccessControlService>(AccessControlService);
  });

  afterAll(async () => {
    if (fs.existsSync('access-test.yml')) fs.unlinkSync('access-test.yml');
    if (fs.existsSync('access-test.yaml')) fs.unlinkSync('access-test.yaml');
    if (fs.existsSync('access-test.json')) fs.unlinkSync('access-test.json');
  });

  describe('loadAccessRouteMap', () => {
    it('should load yaml file', async () => {
      const content = `
      '*': sys:root,sys:service,auth:admin
      'users/*': auth:user_manager
      `;
      fs.writeFileSync('access-test.yml', content, 'utf-8');
      expect(service.loadAccessRouteMap('access-test.yml')).toMatchObject({
        '*': 'sys:root,sys:service,auth:admin',
        'users/*': 'auth:user_manager',
      });

      fs.writeFileSync('access-test.yaml', content, 'utf-8');
      expect(service.loadAccessRouteMap('access-test.yaml')).toMatchObject({
        '*': 'sys:root,sys:service,auth:admin',
        'users/*': 'auth:user_manager',
      });
    });

    it('should load json file', async () => {
      const content = `
      {
        "*": "sys:root,sys:service,auth:admin",
        "users/*": "auth:user_manager"
      }
      `;
      fs.writeFileSync('access-test.json', content, 'utf-8');
      expect(service.loadAccessRouteMap('access-test.json')).toMatchObject({
        '*': 'sys:root,sys:service,auth:admin',
        'users/*': 'auth:user_manager',
      });
    });
  });

  describe('findMatchedRoutes', () => {
    it('should find matched routes', async () => {
      const routeMap = {
        '*': 'sys:root,sys:service,auth:admin',
        '/users': 'auth:admin',
        '/users/*': 'auth:user_manager',
        '/users/:userId': 'auth:user_manager',
        '/namespaces/*/users': 'auth:ns_manager',
      };

      expect(service.findMatchedRoutes(routeMap, '/me')).toStrictEqual(['*']);
      expect(service.findMatchedRoutes(routeMap, '/users')).toStrictEqual(['*', '/users']);
      expect(service.findMatchedRoutes(routeMap, '/users/123')).toStrictEqual([
        '*',
        '/users/*',
        '/users/:userId',
      ]);
      expect(service.findMatchedRoutes(routeMap, '/namespaces/123/users')).toStrictEqual([
        '*',
        '/namespaces/*/users',
      ]);
    });
  });

  describe('checkRole', () => {
    it('should match denied roles', async () => {
      expect(service.checkRole('!admin,root', ['root'])).toBeFalsy();
    });

    it('should match access roles', async () => {
      expect(service.checkRole('admin,root', ['root'])).toBeTruthy();
    });

    it('should not match roles', async () => {
      expect(service.checkRole('admin,root', ['user'])).toBeNull();
      expect(service.checkRole('!admin,root', ['user'])).toBeNull();
    });
  });
});
