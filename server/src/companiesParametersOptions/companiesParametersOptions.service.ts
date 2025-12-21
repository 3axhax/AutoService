import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CompaniesParametersOptions } from './companiesParametersOptions.model';

@Injectable()
export class CompaniesParametersOptionsService {
  constructor(
    @InjectModel(CompaniesParametersOptions)
    private companiesParametersOptionsRepository: typeof CompaniesParametersOptions,
  ) {}

  async getAll(): Promise<CompaniesParametersOptions[] | null> {
    return this.companiesParametersOptionsRepository.findAll();
  }

  async getOptionsByCompany(
    companyId: number,
  ): Promise<CompaniesParametersOptions | null> {
    return this.companiesParametersOptionsRepository.findOne({
      where: { companyId },
    });
  }

  formatStringList(string: string): number[] {
    return string
      ? string
          .split(',')
          .map((item) => parseInt(item.trim()))
          .filter((item) => item > 0)
      : [];
  }
}
