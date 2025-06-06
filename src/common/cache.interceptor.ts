import { Cache, CACHE_KEY_METADATA, CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Debug from 'debug';
import { isArray } from 'lodash';
import { Observable, tap } from 'rxjs';

const debug = Debug('commom:cache-interceptor');

function compileKey(keyStr: string, data: any) {
  if (!keyStr) return keyStr;
  if (!data) return keyStr;
  if (isArray(data)) return keyStr;
  const keys = Object.keys(data);
  let result = keyStr;

  keys.forEach((k) => {
    const value = data[k];
    // 处理复杂对象
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    result = result.replace(`:${k}`, stringValue);
  });
  return result;
}

@Injectable()
export class UnsetCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private reflector: Reflector
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    let cacheKey = this.reflector.getAllAndOverride<string>(CACHE_KEY_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);

    // cacheKey 不存在时，用 url 作为 key
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const { query, body, params, url } = request;
      if (!cacheKey) cacheKey = url;
      else cacheKey = compileKey(cacheKey, { query, body, params, ...query, ...body, ...params });
    }

    if (context.getType() === 'rpc') {
      const ctx = context.switchToRpc();
      const payload = ctx.getData();
      cacheKey = compileKey(cacheKey, { payload, ...payload });
    }

    return next.handle().pipe(
      tap((data) => {
        // 从返回结果构造 key
        cacheKey = compileKey(cacheKey, data?.toJSON ? data.toJSON() : data);
        // 清除缓存
        if (typeof cacheKey === 'string') {
          // cacheKey 可能用逗号分隔 多个 key
          cacheKey.split(',').forEach((key) => this.cacheService.del(key));
        }

        debug(`unset cache: ${cacheKey}`);
      })
    );
  }
}

@Injectable()
export class SetCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    //@ts-ignore
    let cacheKey = this.reflector.getAllAndOverride<string>(CACHE_KEY_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const { body, params, url, query } = request;

      // 本次请求忽略 cache
      if (query.noCache) {
        delete query.noCache;
        return undefined;
      }

      if (!cacheKey) cacheKey = url;
      else cacheKey = compileKey(cacheKey, { query, body, params, ...query, ...body, ...params });
    }

    if (context.getType() === 'rpc') {
      const ctx = context.switchToRpc();
      const payload = ctx.getData();

      // 本次请求忽略 cache
      if (payload.noCache) {
        delete payload.noCache;
        return undefined;
      }

      cacheKey = compileKey(cacheKey, { payload, ...payload });
    }

    debug(`set cache: ${cacheKey}`);

    return cacheKey || super.trackBy(context);
  }
}
