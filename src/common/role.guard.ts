import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { concat, intersection } from 'lodash';
import { Observable } from 'rxjs';

import { PassportAuth } from 'src/auth';

import { errCodes } from './err-code';

export enum Role {
  ADMIN = 'ADMIN',
  AUTH_MANAGER = 'AUTH_MANAGER',
  USER_MANAGER = 'USER_MANAGER',
  NS_MANAGER = 'NS_MANAGER',
  SESSION_MANAGER = 'SESSION_MANAGER',
}

@Injectable()
class RoleGuard implements CanActivate {
  constructor(private roles: Role[] = []) {
    // ADMIN 和 AUTH_MANAGER 为管理员
    this.roles = concat(roles, [Role.ADMIN, Role.AUTH_MANAGER]);
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userInfo: PassportAuth = request.user;

    // 超级管理员
    if (userInfo.super) return true;

    // 匹配当前用户的角色列表和权限所需的角色列表，有共同的角色
    if (intersection(this.roles, userInfo.roles).length > 0) {
      return true;
    }

    throw new ForbiddenException({
      message: `Should have any role of: ${this.roles.join(', ')}`,
      code: errCodes.USER_ROLE_REQUIRED,
    });
  }
}

export function WithRoleGuard(...roles: Role[]) {
  return applyDecorators(UseGuards(new RoleGuard(roles)));
}
