import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import lodash from 'lodash';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ErrorCodes } from './constants';

function isMongoError(error: any): boolean {
  return ['MongoError', 'MongoServerError'].includes(error.name);
}

function isCastError(error: any): boolean {
  return error.name === 'CastError';
}

@Injectable()
export class MongoErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (isMongoError(err)) {
          switch (err.code) {
            case 11000:
              return throwError(
                () =>
                  new ConflictException({
                    code: ErrorCodes.DUPLICATE,
                    message: err.message,
                    details: [
                      {
                        message: err.message,
                        field: lodash.isObject(err.keyPattern)
                          ? Object.keys(err.keyPattern).join(',')
                          : err.keyPattern,
                      },
                    ],
                  })
              );
            default:
              return throwError(() => new InternalServerErrorException(err.message));
          }
        }
        if (isCastError(err)) {
          return throwError(
            () =>
              new BadRequestException({
                code: ErrorCodes.CASTERROR,
                message: err.message,
                details: [
                  {
                    message: err.message,
                    field: err.path,
                  },
                ],
              })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
