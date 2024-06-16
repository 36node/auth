import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { set } from 'lodash';

import { errCodes } from '../common/err-code';

import { Namespace } from './entities/namespace.entity';
import { NamespaceService } from './namespace.service';

@Injectable()
export class LoadNamespaceMiddleware implements NestMiddleware {
  constructor(private readonly namespaceService: NamespaceService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let namespace: Namespace;
    const namespaceId = req.params.namespaceId;
    const namespaceIdOrNs = req.params.namespaceIdOrNs;

    if (namespaceId) {
      try {
        namespace = await this.namespaceService.get(namespaceId);
        set(req, 'state.namespace', namespace);
      } catch (error) {
        // 处理查询用户失败的情况
        console.error('Error loading namespace:', error);
      }
    } else if (namespaceIdOrNs) {
      try {
        namespace = await this.namespaceService.get(namespaceIdOrNs);
        set(req, 'state.namespace', namespace);
      } catch (error) {
        // 处理查询用户失败的情况
        console.error('Error loading namespace:', error);
      }
    }

    if (!namespace) {
      throw new NotFoundException({
        code: errCodes.NAMESPACE_NOT_FOUND,
        message: `Namespace ${namespaceId || namespaceIdOrNs} not found.`,
      });
    }
    next();
  }
}
