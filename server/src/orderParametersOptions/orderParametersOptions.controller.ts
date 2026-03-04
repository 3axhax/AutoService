import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrderParametersOptionsService } from './orderParametersOptions.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRoleEnum } from '../roles/roles.types';

@Controller('orderParameters')
export class OrderParametersOptionsController {
  constructor(
    private orderParametersOptionsService: OrderParametersOptionsService,
  ) {}
  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  getAll() {
    return this.orderParametersOptionsService.getAll();
  }
}
