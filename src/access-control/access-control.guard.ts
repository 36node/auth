import fs from 'fs';

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Debug from 'debug';
import { BehaviorSubject, Observable } from 'rxjs';

import { PassportAuth } from 'src/auth';
import { IS_PUBLIC_KEY } from 'src/common';
import { settings } from 'src/config';

import { AccessControlService } from './access-control.service';

const debug = Debug('access-control:guard');
const rootDir = __dirname + '/../../';

@Injectable()
export class AccessControlGuard implements CanActivate {
  private accessRouteMapSubject: BehaviorSubject<Record<string, string>>;
  private accessRouteFilePath: string;

  constructor(
    private reflector: Reflector,
    private readonly accessControlService: AccessControlService
  ) {
    const { watch, file } = settings.access.control;
    this.accessRouteFilePath = `${rootDir}/${file}`;
    this.accessRouteMapSubject = new BehaviorSubject(
      this.accessControlService.loadAccessRouteMap(this.accessRouteFilePath)
    );
    debug('Access route map: ', this.accessRouteMapSubject.getValue());
    if (watch) {
      this.watchAccessRouteFileChanges();
    }
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 放行 Public 接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userInfo: PassportAuth = request.user;
    // 受限接口会抛出 401
    if (!userInfo) {
      return true;
    }

    // super 用户开放权限
    const { super: isSuperUser = false, roles: userRoles = [] } = userInfo;
    if (isSuperUser) {
      return true;
    }

    // 路由映射为空，直接放行
    const route = request.path;
    const accessRouteMap = this.accessRouteMapSubject.getValue();
    if (!accessRouteMap) {
      return true;
    }

    debug('route: ', route);

    // 查找匹配的路由, 找不到则放行
    const matchedRoutes = this.accessControlService.findMatchedRoutes(accessRouteMap, route);
    if (!matchedRoutes.length) {
      return true;
    }

    // 判断权限
    let pass = false;
    for (let index = 0; index < matchedRoutes.length; index++) {
      const matchedRoute = matchedRoutes[index];
      const roleList = accessRouteMap[matchedRoute];
      const checkResult = this.accessControlService.checkRole(roleList, userRoles);
      debug('Matched Route rule: ', matchedRoute);
      debug('Role List: ', roleList);
      debug('User Roles: ', userRoles);
      debug('Check Result: ', checkResult);
      if (checkResult != null) {
        pass = checkResult;
        break;
      }
    }
    if (!pass) {
      throw new ForbiddenException(`No permission to access ${route}`);
    }

    return true;
  }

  private watchAccessRouteFileChanges() {
    fs.watch(this.accessRouteFilePath, (event, filename) => {
      if (event === 'change') {
        console.log(`${filename} has been changed. Reloading access map...`);
        this.accessRouteMapSubject = new BehaviorSubject(
          this.accessControlService.loadAccessRouteMap(this.accessRouteFilePath)
        );
      }
    });
  }
}
