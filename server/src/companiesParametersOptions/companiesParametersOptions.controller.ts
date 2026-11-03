import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CompaniesParametersOptionsService } from './companiesParametersOptions.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRoleEnum } from '../roles/roles.types';

@Controller('companiesParametersOptions')
export class CompaniesParametersOptionsController {
  constructor(
    private companiesParametersOptionsService: CompaniesParametersOptionsService,
  ) {}
  @Get()
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  getAll(@User() user: UserModel | undefined) {
    return this.companiesParametersOptionsService.getAll({ user });
  }
}
