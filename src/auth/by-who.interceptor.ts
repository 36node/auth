import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { get } from 'lodash';
import { Observable } from 'rxjs';

@Injectable()
export class ByWhoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const userId = get(request, 'user.id');
    if (userId && request.body) {
      if (request.method === 'POST') request.body.createBy = userId;
      if (request.method === 'PUT' || request.method === 'PATCH') request.body.updateBy = userId;
      if (request.method === 'DELETE') request.body.deleteBy = userId;
    }
    return next.handle();
  }
}
