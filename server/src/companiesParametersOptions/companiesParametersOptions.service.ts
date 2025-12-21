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
}
