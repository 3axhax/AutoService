import type { Transaction } from 'sequelize';
import { User } from '../users/users.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Companies, CompaniesCreationAttrs } from './companies.model';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Companies)
    private companiesRepository: typeof Companies,
  ) {}

  async getAll({
    user,
  }: {
    user: User | undefined;
  }): Promise<Companies[] | null> {
    if (!user) return null;
    return this.companiesRepository.findAll({ where: { id: user.companyId } });
  }

  async createCompany(
    company: CompaniesCreationAttrs,
    transaction?: Transaction,
  ): Promise<Companies> {
    return this.companiesRepository.create(company, { transaction });
  }
}
