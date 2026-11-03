import { Reflector } from '@nestjs/core';
import { REQUIRE_SESSION } from './roles-auth.decorator';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.model';

interface AuthHeaders {
  authorization?: string;
}

interface AuthRequest {
  headers: AuthHeaders;
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      const user: User | null = await this.usersService.getUserByToken(token);
      if (user) {
        request.user = user;
      }
    }

    if (
      this.reflector.getAllAndOverride<boolean>(REQUIRE_SESSION, [
        context.getHandler(),
        context.getClass(),
      ]) &&
      !request.user
    )
      throw new UnauthorizedException('User unauthorized');
    return true;
  }

  private extractTokenFromHeader(request: AuthRequest): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
