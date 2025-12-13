import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      const user: User | null = await this.usersService.getUserByToken(token);
      if (user) {
        request.user = user;
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: AuthRequest): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
