import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Observable } from 'rxjs';
import type { RequestWithId } from '../http/request-with-id';
import type { Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();
    const header = request.headers['x-request-id'];
    const incoming = Array.isArray(header) ? header[0] : header;
    request.requestId = incoming && incoming.length > 0 ? incoming : randomUUID();
    response.setHeader('x-request-id', request.requestId);
    return next.handle();
  }
}
