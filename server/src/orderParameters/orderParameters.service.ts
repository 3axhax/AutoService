import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderParameters } from './orderParameters.model';
import { User } from '../users/users.model';
import { CompaniesParametersOptionsService } from '../companiesParametersOptions/companiesParametersOptions.service';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { ResponseParametersWithOptions } from './orderParameters.controller';

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
      const attributes =
        user && user.roles.length === 1 && user.roles[0].value === 'WORKER'
          ? ['id', 'name', 'translationRu', 'type', 'order']
          : user.roles.length > 0 &&
              user.roles.map((role) => role.value).includes('ADMIN')
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
