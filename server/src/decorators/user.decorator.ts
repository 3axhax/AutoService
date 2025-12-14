import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserModel } from '../users/users.model';

interface UserRequest {
  user?: UserModel;
}

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserModel | undefined => {
    const request: UserRequest = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
