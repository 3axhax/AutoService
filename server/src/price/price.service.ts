import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Price } from './price.model';
import { FindOptions } from 'sequelize';
import { User } from '../users/users.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { OrderParametersService } from '../orderParameters/orderParameters.service';

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

    let total = 0;
    let totalWithDiscount = 0;
    let discount = 1;

    const parametersList = await this.orderParametersService.getAll({ user });

    const parametersListWithOptions = parametersList.parameters
      ?.filter(
        (parameter) => parameter.get({ plain: true }).options?.length > 0,
      )
      .map((parameter) => parameter.name);

    const usefulParam = {} as Record<
      string,
      string | Record<number | string, number>
    >;

    if (parametersListWithOptions) {
      Object.entries(param).forEach(([key, value]) => {
        if (parametersListWithOptions.includes(key)) {
          usefulParam[key] = value;
        }
      });
    }

    const selectedValues = Object.values(usefulParam).reduce(
      (acc: Record<number, number>, value) => {
        if (typeof value === 'object' && value !== null) {
          let values = {};
          for (const k in value) {
            if (+value[k] > 0) {
              values = { ...values, [+k]: +value[k] };
            }
          }
          return { ...acc, ...values };
        }
        return { ...acc, [+value]: 1 };
      },
      {},
    );

    const selectedParameters = Object.values(usefulParam).reduce(
      (acc: number[], value) => {
        if (typeof value === 'object' && value !== null) {
          const values: number[] = [];
          for (const k in value) {
            if (+value[k] > 0) {
              values.push(+k);
            }
          }
          return [...acc, ...values];
        }
        return [...acc, +value];
      },
      [],
    );

    if (parametersList && parametersList.parameters) {
      const discountParameter = parametersList.parameters
        .find((parameter) => parameter.name === 'discount')
        ?.get({ plain: true });

      if (discountParameter && discountParameter.options) {
        const selectedDiscount = discountParameter.options.find((option) =>
          selectedParameters.includes(option.id),
        );
        if (selectedDiscount) {
          discount = 1 - parseInt(selectedDiscount.translationRu) / 100;
        }
      }
    }

    const relatedPrice = companyPrice
      ? companyPrice.reduce((acc: Price[], priceDB) => {
          const price = priceDB?.get({ plain: true });
          if (
            price.conditions &&
            price.conditions
              .map((item) => item.id)
              .every((item) => selectedParameters.includes(item))
          ) {
            let result = [...acc];
            result = result.filter((existingPrice) => {
              return !existingPrice.conditions
                .map((item) => item.id)
                .every((item) =>
                  price.conditions
                    .map((condition) => condition.id)
                    .includes(item),
                );
            });
            return [...result, price];
          }
          return acc;
        }, [])
      : [];

    relatedPrice.forEach((price) => {
      totalWithDiscount +=
        price.value *
        price.conditions.reduce((acc: number, condition) => {
          return acc * +selectedValues[condition.id];
        }, 1) *
        (price.discountImpact ? discount : 1);
      total +=
        price.value *
        price.conditions.reduce((acc: number, condition) => {
          return acc * +selectedValues[condition.id];
        }, 1);
    });

    return {
      totalValue: total,
      totalValueWithDiscount: totalWithDiscount,
    };
  }
}
