import { BadRequestException, HttpException } from '@nestjs/common';

export function assert(condition: boolean, msg = 'error occured', ErrConstructor = Error) {
  if (!condition) {
    throw new ErrConstructor(msg);
  }
}

export function assertHttp(
  condition: any,
  message: string,
  Exception: new (...args: any[]) => HttpException = BadRequestException
): asserts condition {
  if (!condition) {
    throw new Exception(message);
  }
}
