import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles-auth.decorator';
import { UsersService } from '../users/users.service';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';

interface IUser {
  id: number;
  roles: Array<{ value: string }>;
}

interface IRequest {
  headers: {
    authorization?: string;
  };
  user?: IUser;
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
    private userSessionsService: UsersSessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: IRequest = context.switchToHttp().getRequest();
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        this.unauthorizedError();
        return false;
      }
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        this.unauthorizedError();
        return false;
      }
      const session = await this.userSessionsService.checkUser({ token });
      if (!session) {
        this.unauthorizedError();
        return false;
      }

      const userDB = await this.userService.getUserById(session.userId);
      if (!userDB) {
        this.unauthorizedError();
        return false;
      }
      req.user = userDB;
      const plainUserDB = userDB.get({ plain: true });
      return plainUserDB.roles.some((role) =>
        requiredRoles.includes(role.value),
      );
    } catch (e) {
      console.log(e);
      throw new HttpException('Request Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  private unauthorizedError() {
    throw new UnauthorizedException({
      error_no: 401,
      error: 'User unauthorized',
      statusCode: 401,
    });
  }
}
