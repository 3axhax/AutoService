import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Price } from './price.model';
import { FindOptions } from 'sequelize';
import { User } from '../users/users.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { OrderParametersService } from '../orderParameters/orderParameters.service';
import { calculateOrderPrice } from '@autoservice/pricing';

@Injectable()
export class PriceService {
  constructor(
    @InjectModel(Price)
    private priceRepository: typeof Price,
    private orderParametersService: OrderParametersService,
  ) {}

  async getAll({ user }: { user: User | undefined }): Promise<Price[] | null> {
    if (user) {
      const params: FindOptions<Price> = {
        where: { companyId: user?.companyId },
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
    return null;
  }

  async calculateTotalValue({
    user,
    param,
  }: {
    user: User;
    param: Record<string, string | Record<number | string, number>>;
  }): Promise<{ totalValue: number; totalValueWithDiscount: number }> {
    const companyPrice = await this.getAll({ user });
    const parametersList = await this.orderParametersService.getAll({ user });

    return calculateOrderPrice({
      orderValues: param,
      priceList:
        companyPrice?.map((price) => price.get({ plain: true })) ?? [],
      parameters:
        parametersList.parameters?.map((parameter) =>
          parameter.get({ plain: true }),
        ) ?? [],
    });
  }
}
