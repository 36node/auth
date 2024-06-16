import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import lodash from 'lodash';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    // filter manul throw exceptions
    if (exception instanceof HttpException) {
      const cause = exception.getResponse();
      const code = lodash.get(cause, 'code');
      const message = lodash.get(cause, 'message');
      const details = lodash.get(cause, 'details', undefined);
      if (code && message) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.status(exception.getStatus()).json({
          status: exception.getStatus(),
          code,
          message,
          details,
        });
      }
    }

    super.catch(exception, host);
  }
}
