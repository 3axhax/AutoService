import { Controller, Get, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRoleEnum } from '../roles/roles.types';

@Controller('orderParameters')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}
  @Get()
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  getAll() {
    return this.companiesService.getAll();
  }
}
