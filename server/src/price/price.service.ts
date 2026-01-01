import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Price } from './price.model';
import { FindOptions } from 'sequelize';
import { User } from '../users/users.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';

@Injectable()
export class PriceService {
  constructor(
    @InjectModel(Price)
    private priceRepository: typeof Price,
  ) {}

  async getAll({ user }: { user: User | null }): Promise<Price[]> {
    if (user && user.roles.length === 1 && user.roles[0].value === 'WORKER') {
      //return this.getParametersForWorker({ user });
    }
    const params: FindOptions<Price> = {
      attributes: ['value', 'discountImpact'],
      include: [
        {
          model: OrderParametersOptions,
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    };
    return await this.priceRepository.findAll(params);
  }
}
