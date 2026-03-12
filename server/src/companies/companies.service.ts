import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Companies, CompaniesCreationAttrs } from './companies.model';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Companies)
    private companiesRepository: typeof Companies,
  ) {}

  async getAll(): Promise<Companies[] | null> {
    return this.companiesRepository.findAll();
  }

  async createCompany(company: CompaniesCreationAttrs): Promise<Companies> {
    return this.companiesRepository.create(company);
  }
}
