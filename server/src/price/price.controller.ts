import { Controller, Get, UseGuards } from '@nestjs/common';
import { PriceService } from './price.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { Price } from './price.model';
import { UserRoleEnum } from '../roles/roles.types';

@Controller('price')
export class PriceController {
  constructor(private priceService: PriceService) {}
  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  getAll(@User() user: UserModel | undefined): Promise<Price[] | null> {
    return this.priceService.getAll({
      user,
    });
  }
}
