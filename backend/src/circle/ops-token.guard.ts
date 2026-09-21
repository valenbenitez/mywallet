import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { loadCircleOpsToken } from './circle.config.js';

function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

@Injectable()
export class OpsTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const headerValue = request.header('x-ops-token');
    const expected = loadCircleOpsToken();

    if (!headerValue || !tokensMatch(headerValue, expected)) {
      throw new UnauthorizedException('Invalid or missing X-Ops-Token');
    }

    return true;
  }
}
