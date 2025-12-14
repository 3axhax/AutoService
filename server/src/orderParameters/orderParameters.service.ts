import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderParameters } from './orderParameters.model';
import { Role } from '../roles/roles.model';
import { FindOptions } from 'sequelize';

@Injectable()
export class OrderParametersService {
  constructor(
    @InjectModel(OrderParameters)
    private orderParametersRepository: typeof OrderParameters,
  ) {}

  async getAll({
    roles,
  }: {
    roles: Role[];
  }): Promise<OrderParameters[] | null> {
    const params: FindOptions<OrderParameters> = {
      include: { all: true },
    };
    if (roles.length === 1 && roles[0].value === 'WORKER') {
      params.attributes = ['id', 'name', 'translationRu'];
    }
    return this.orderParametersRepository.findAll(params);
  }
}
