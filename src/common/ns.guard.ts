import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { get, set } from 'lodash';
import { Observable } from 'rxjs';

import { PassportAuth } from 'src/auth';

const defaultNsFields = ['query.ns_scope', 'query.ns', 'params.ns', 'body.ns'];

@Injectable()
export class NsGuard implements CanActivate {
  constructor(private nsFields: string[]) {
    this.nsFields = nsFields;
    if (!nsFields || !nsFields.length) {
      this.nsFields = defaultNsFields;
    }
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // 获取 token 中的 ns, 作为 scope
    const userInfo: PassportAuth = request.user;
    const tokenNs = userInfo.ns;

    // 超级管理员
    if (userInfo.super) return true;

    // 如果 token 没有 ns 的限制，视为开放
    if (!tokenNs) {
      return true;
    }

    const nsShouldGuards = this.nsFields.map((f) => get(request, f)).filter((ns) => ns);

    // 获取需要 guard 的 ns
    nsShouldGuards.forEach((guardNs) => {
      // token 中的 ns 必须是 guard ns 或者 guard ns 的父级
      if (guardNs && !guardNs.startsWith(tokenNs)) {
        throw new ForbiddenException(`no permission to access ns ${guardNs}`);
      }
    });

    // 如果没有需要 guard 的 ns，自动填充 token 中的 ns 到第一个 field 上
    // 确保获取资源时，默认受 ns 限制
    if (!nsShouldGuards.length) {
      set(request, this.nsFields[0], tokenNs);
    }

    return true;
  }
}

export function WithNsGuard(...nsFields: string[]): MethodDecorator {
  return applyDecorators(UseGuards(new NsGuard(nsFields)));
}
