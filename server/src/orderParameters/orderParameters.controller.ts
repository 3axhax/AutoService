import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrderParametersService } from './orderParameters.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';

@Controller('orderParameters')
export class OrderParametersController {
  constructor(private orderParametersService: OrderParametersService) {}
  @Get()
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  getAll(@User() user: UserModel | undefined) {
    return this.orderParametersService.getAll({
      user: user ? user : null,
    });
  }
}
