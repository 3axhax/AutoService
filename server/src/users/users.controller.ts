import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getUsersList(@User() user: UserModel | undefined) {
    return this.usersService.getUsersList({ user });
  }
}
