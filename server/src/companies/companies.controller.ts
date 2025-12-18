import { Controller, Get, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orderParameters')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}
  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getAll() {
    return this.companiesService.getAll();
  }
}
