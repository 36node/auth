import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { PassportAuth } from 'src/auth';
import { errCodes } from 'src/common';

export enum Role {
  ADMIN = 'ADMIN',
  AUTH_MANAGER = 'AUTH_MANAGER',
  USER_MANAGER = 'USER_MANAGER',
  NS_MANAGER = 'NS_MANAGER',
  SESSION_MANAGER = 'SESSION_MANAGER',
}

@Injectable()
class SuperGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userInfo: PassportAuth = request.user;

    // 超级管理员
    if (userInfo.super) return true;

    // 只有超管可以创建超管
    if (request.body.super) {
      throw new ForbiddenException({
        message: `Can not create super user`,
        code: errCodes.USER_CREATE_SUPER_FORBIDDEN,
      });
    }

    return true;
  }
}

export function WithSuperGuard() {
  return applyDecorators(UseGuards(new SuperGuard()));
}
