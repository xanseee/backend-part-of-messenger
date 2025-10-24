import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    
    return next.handle().pipe(
      tap((data) => {
        if (response.statusCode >= 200 && response.statusCode < 300 && data?.refreshToken) {
          response.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 день
          });
          
          delete data.refreshToken;
        }
      })
    );
  }
}