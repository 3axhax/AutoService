import { normalizeOrderInput } from './normalize-order-input';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Price } from './price.model';
import { FindOptions } from 'sequelize';
import { User } from '../users/users.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { OrderParametersService } from '../orderParameters/orderParameters.service';
import { calculateOrderPrice } from '@autoservice/pricing';
import { validateOrderDependencies } from './validate-order-dependencies';
import { ParametersType } from '../orderParameters/orderParametersType.enum';

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
        attributes: ['value', 'discountImpact', 'mainOptionId'],
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
    param: Record<string, unknown>;
  }): Promise<{ totalValue: number; totalValueWithDiscount: number }> {
    const { totalValue, totalValueWithDiscount } = await this.prepareOrder({
      user,
      param,
    });
    return { totalValue, totalValueWithDiscount };
  }

  async prepareOrder({
    user,
    param,
    allowId = true,
  }: {
    user: User;
    param: Record<string, unknown>;
    allowId?: boolean;
  }) {
    const companyPrice = await this.getAll({ user });
    const parametersList = await this.orderParametersService.getAll({ user });
    const plainPrice =
      companyPrice?.map((price) => price.get({ plain: true })) ?? [];

    const values = normalizeOrderInput(
      param,
      parametersList.parameters ?? [],
      allowId,
    );
    validateOrderDependencies(
      values,
      parametersList.parameters ?? [],
      parametersList.options,
    );

    this.validateCompositeParameters({
      param: values,
      priceList: plainPrice,
      parameters: parametersList.parameters,
    });

    const totals = calculateOrderPrice({
      orderValues: values,
      priceList: plainPrice,
      parameters:
        parametersList.parameters?.map((parameter) =>
          parameter.get({ plain: true }),
        ) ?? [],
    });
    return { ...totals, values, parameters: parametersList.parameters ?? [] };
  }

  private validateCompositeParameters({
    param,
    priceList,
    parameters,
  }: {
    param: Record<string, unknown>;
    priceList: Price[];
    parameters: Awaited<
      ReturnType<OrderParametersService['getAll']>
    >['parameters'];
  }) {
    const baseIds = new Set<number>();
    (parameters ?? []).forEach((parameter) => {
      if (
        ![ParametersType.SELECT, ParametersType.SELECT_LIST].includes(
          parameter.type,
        )
      )
        return;
      const value = param[parameter.name];
      if (Array.isArray(value) || typeof value === 'boolean') return;
      const ids =
        value && typeof value === 'object'
          ? Object.entries(value)
              .filter(
                ([, count]) =>
                  Number.isFinite(Number(count)) && Number(count) > 0,
              )
              .map(([id]) => Number(id))
          : value
            ? [Number(value)]
            : [];
      ids
        .filter((id) => parameter.options.some((option) => option.id === id))
        .forEach((id) => baseIds.add(id));
    });

    (parameters ?? [])
      .filter((parameter) => parameter.type === ParametersType.COMPOSITE_LIST)
      .forEach((parameter) => {
        const operations = param[parameter.name];
        if (operations === undefined) return;
        if (!Array.isArray(operations)) {
          throw new BadRequestException(`${parameter.name} must be an array`);
        }
        const groups = new Map<string, Set<number>>();
        parameter.options.forEach((option) => {
          if (!option.optionGroup) return;
          groups.set(
            option.optionGroup,
            new Set([...(groups.get(option.optionGroup) ?? []), option.id]),
          );
        });

        operations.forEach((operation, index) => {
          if (
            !operation ||
            typeof operation !== 'object' ||
            Array.isArray(operation)
          ) {
            throw new BadRequestException(
              `Invalid ${parameter.name} operation ${index + 1}`,
            );
          }
          const candidate = operation as Record<string, unknown>;
          const optionIds = Array.isArray(candidate.optionIds)
            ? candidate.optionIds.map(Number)
            : [];
          const count = Number(candidate.count ?? 1);
          const hasOneOptionFromEveryGroup =
            optionIds.length === groups.size &&
            [...groups.values()].every(
              (groupOptionIds) =>
                optionIds.filter((id) => groupOptionIds.has(id)).length === 1,
            );
          if (
            !hasOneOptionFromEveryGroup ||
            !Number.isInteger(count) ||
            count < 1
          ) {
            throw new BadRequestException(
              `Invalid ${parameter.name} operation ${index + 1}`,
            );
          }

          const selectedIds = new Set([...baseIds, ...optionIds]);
          const everyOptionHasPrice = optionIds.every((optionId) =>
            priceList.some(
              (price) =>
                price.mainOptionId === optionId &&
                price.conditions.every((condition) =>
                  selectedIds.has(condition.id),
                ),
            ),
          );
          if (!everyOptionHasPrice) {
            throw new BadRequestException(
              `Unavailable option combination in ${parameter.name} operation ${index + 1}`,
            );
          }
        });
      });
  }
}
