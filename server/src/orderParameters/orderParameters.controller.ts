import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrderParametersService } from './orderParameters.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { OrderParameters } from './orderParameters.model';
import { UserRoleEnum } from '../roles/roles.types';

export interface ResponseParametersWithOptions {
  parameters: OrderParameters[] | null;
  options: {
    parameterOptionDependence: string;
    optionOptionDependence: string;
  };
}

@Controller('orderParameters')
export class OrderParametersController {
  constructor(private orderParametersService: OrderParametersService) {}
  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  getAll(
    @User() user: UserModel | undefined,
  ): Promise<ResponseParametersWithOptions> {
    return this.orderParametersService.getAll({
      user,
    });
  }
}
