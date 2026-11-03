import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRoleEnum } from '../roles/roles.types';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}
  @Get()
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  getAll(@User() user: UserModel | undefined) {
    return this.companiesService.getAll({ user });
  }
}
