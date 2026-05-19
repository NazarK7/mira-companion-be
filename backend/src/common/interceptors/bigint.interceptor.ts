// backend/src/common/interceptors/bigint.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.serializeBigInt(data)));
  }

private serializeBigInt(data: any): any {
    if (data === null || data === undefined) return data;
    if (typeof data === 'bigint') return data.toString();
    
    // AGGIUNTO: Se è una data, non toccarla (la gestisce Nest di default)
    if (data instanceof Date) return data; 
    
    if (Array.isArray(data)) return data.map((item) => this.serializeBigInt(item));
    if (typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, this.serializeBigInt(value)])
      );
    }
    return data;
  }
}