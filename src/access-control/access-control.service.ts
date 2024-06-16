import fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';
import yaml from 'js-yaml';
import { endsWith, intersection } from 'lodash';
import pathToRegexp from 'path-to-regexp';

@Injectable()
export class AccessControlService {
  /**
   * 解析 access 配置文件
   * @param filePath 文件路径
   * @returns map
   */
  loadAccessRouteMap(filePath: string): Record<string, string> {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    if (endsWith(filePath, 'json')) {
      return require(path.resolve(filePath));
    }
    if (endsWith(filePath, 'yaml') || endsWith(filePath, 'yml')) {
      const fData = fs.readFileSync(filePath, 'utf8');
      const accessMap = yaml.load(fData) as Record<string, string>;
      return accessMap;
    }
    return null;
  }

  /**
   * 查找匹配到的路由
   * @param routeMap 路由映射对象
   * @param route 需要匹配的路由
   * @returns
   */
  findMatchedRoutes(routeMap: Record<string, string>, route: string): string[] {
    const matchedRoutes: string[] = [];
    for (const key in routeMap) {
      const regex = pathToRegexp(key);
      if (regex.test(route)) {
        matchedRoutes.push(key);
      }
    }

    return matchedRoutes;
  }

  /**
   * 检查角色匹配情况
   * @param expectedRoles 要求的角色列表 (字符串, 可能包含 ‘!’)
   * @param actualRoles 用户的角色列表
   * @returns pass 角色未匹配到, 返回 null, 否则根据角色是否匹配返回 true 或者 false
   */
  checkRole(expectedRoles: string, actualRoles: string[]): boolean | null {
    let pass: boolean | null = null;
    if (expectedRoles.startsWith('!')) {
      // 反向权限控制, 包含这些角色的用户均不能访问
      const deniedRoles = expectedRoles.substring(1).split(',');
      if (intersection(deniedRoles, actualRoles).length > 0) {
        pass = false;
      }
    } else {
      // 正向权限控制, 包含这些角色的用户可以访问
      const passRoles = expectedRoles.split(',');
      if (intersection(passRoles, actualRoles).length > 0) {
        pass = true;
      }
    }
    return pass;
  }
}
