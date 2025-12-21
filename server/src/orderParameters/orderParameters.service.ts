import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderParameters } from './orderParameters.model';
import { FindOptions } from 'sequelize';
import { User } from '../users/users.model';
import { CompaniesParametersOptionsService } from '../companiesParametersOptions/companiesParametersOptions.service';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';

@Injectable()
export class OrderParametersService {
  constructor(
    @InjectModel(OrderParameters)
    private orderParametersRepository: typeof OrderParameters,
    private companiesParametersOptionsService: CompaniesParametersOptionsService,
  ) {}

  async getAll({
    user,
  }: {
    user: User | null;
  }): Promise<OrderParameters[] | null> {
    if (user && user.roles.length === 1 && user.roles[0].value === 'WORKER') {
      return this.getParametersForWorker({ user });
    }
    const params: FindOptions<OrderParameters> = {
      include: { all: true },
    };
    return this.orderParametersRepository.findAll(params);
  }

  async getParametersForWorker({ user }: { user: User }) {
    const options =
      await this.companiesParametersOptionsService.getOptionsByCompany(
        user.companyId,
      );
    console.log(options?.parametersList);
    if (options) {
      const parametersList =
        this.companiesParametersOptionsService.formatStringList(
          options.parametersList,
        );
      const optionsList =
        this.companiesParametersOptionsService.formatStringList(
          options.optionsList,
        );
      return this.orderParametersRepository.findAll({
        where: {
          id: parametersList,
        },
        attributes: ['id', 'name', 'translationRu', 'type'],
        include: [
          {
            model: OrderParametersOptions,
            where: {
              id: optionsList,
            },
            attributes: ['id', 'translationRu'],
            required: false,
          },
        ],
      });
    }
    return null;
  }
}
