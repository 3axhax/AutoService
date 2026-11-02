import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class RegistrationRateLimitGuard implements CanActivate {
  private readonly intervalMs = 10_000;
  private readonly expiresAt = new Map<string, number>();
  private nextCleanupAt = 0;

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const now = Date.now();

    if (now >= this.nextCleanupAt) {
      for (const [ip, expiry] of this.expiresAt) {
        if (expiry <= now) this.expiresAt.delete(ip);
      }
      this.nextCleanupAt = now + this.intervalMs;
    }

    // Express resolves req.ip using the explicitly configured trusted proxy.
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const expiry = this.expiresAt.get(ip) ?? 0;
    if (expiry > now) {
      http
        .getResponse<Response>()
        .setHeader('Retry-After', String(Math.ceil((expiry - now) / 1000)));
      throw new HttpException(
        'Существует лимит на частоту регистрации. Попробуйте позже',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.expiresAt.set(ip, now + this.intervalMs);
    return true;
  }
}
