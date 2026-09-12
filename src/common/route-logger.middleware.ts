import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RouteLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startAt = process.hrtime();
    const { ip, method, originalUrl } = request;
    const path = originalUrl.split('?')[0];
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const userId = request['user'] ? request['user'].subject : 'anonymous';
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const diff = process.hrtime(startAt);
      const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed();
      this.logger.log(
        `${method} ${path} ${statusCode} ${responseTime}ms ${contentLength} - ${userAgent} ${ip} ${userId}`
      );
    });

    next();
  }
}
