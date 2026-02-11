import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderParameters } from './orderParameters.model';
import { User } from '../users/users.model';
import { CompaniesParametersOptionsService } from '../companiesParametersOptions/companiesParametersOptions.service';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { ResponseParametersWithOptions } from './orderParameters.controller';
import { Order } from 'sequelize';

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
    user: User | undefined;
  }): Promise<ResponseParametersWithOptions> {
    if (user) {
      const attributes = user.isOnlyWorker
        ? ['id', 'name', 'translationRu', 'type', 'order']
        : user.isAdmin
          ? ['id', 'name', 'translationRu', 'type', 'order']
          : [];
      const options =
        await this.companiesParametersOptionsService.getOptionsByCompany(
          user.companyId,
        );
      if (options) {
        const parametersList =
          this.companiesParametersOptionsService.formatStringList(
            options.parametersList,
          );
        const optionsList =
          this.companiesParametersOptionsService.formatStringList(
            options.optionsList,
          );
        const parameters = await this.orderParametersRepository.findAll({
          where: {
            id: parametersList,
          },
          attributes,
          order: [['order', 'ASC']] as Order,
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

        return {
          parameters,
          options: {
            parameterOptionDependence: options.parameterOptionDependence,
            optionOptionDependence: options.optionOptionDependence,
          },
        };
      }
    }
    return {
      parameters: [],
      options: {
        parameterOptionDependence: '',
        optionOptionDependence: '',
      },
    };
  }

  async getParameterByName(name: string) {
    return await this.orderParametersRepository.findOne({ where: { name } });
  }
}
