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

import { errCodes } from 'src/common';

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
                    code: errCodes.DUPLICATE,
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
                code: errCodes.CASTERROR,
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
