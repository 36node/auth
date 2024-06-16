import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { set } from 'lodash';

import { errCodes } from 'src/common/err-code';

import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Injectable()
export class LoadUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.userId;
    let user: User;
    if (userId) {
      try {
        user = await this.userService.get(userId);
        set(req, 'state.user', user);
      } catch (error) {
        // 处理查询用户失败的情况
        console.error('Error loading user:', error);
      }
    }

    if (!user) {
      throw new NotFoundException({
        code: errCodes.USER_NOT_FOUND,
        message: `User ${userId} not found.`,
      });
    }
    next();
  }
}
