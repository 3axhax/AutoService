import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { Orders } from './orders.model';
import { OrderParametersService } from '../orderParameters/orderParameters.service';
import {
  OrdersOptionValues,
  OrdersOptionValuesCreationAttrs,
} from './ordersOptionValues.model';
import { isObject } from 'class-validator';
import { OrderParameters } from '../orderParameters/orderParameters.model';
import { ShiftsService } from '../shifts/shifts.service';
import { PriceService } from '../price/price.service';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Orders)
    private ordersRepository: typeof Orders,
    private orderParametersService: OrderParametersService,
    private shiftsService: ShiftsService,
    private priceService: PriceService,
  ) {}

  async addNew({
    user,
    param,
  }: {
    user: User | undefined;
    param: Record<string, string | Record<number | string, number>>;
  }): Promise<Orders | null> {
    if (param && user) {
      const shift =
        await this.shiftsService.getOrCreateActiveShiftByUserCompany({
          userId: user.id,
          companyId: user.companyId,
        });

      const order = this.ordersRepository.build({
        companyId: user.companyId,
        shiftId: shift.id,
        totalValue: await this.priceService.calculateTotalValue({
          user,
          param,
        }),
      });

      const parametersOptions = await this._formatParamToOptions(param);

      order.setOptions(parametersOptions);
      await order.save();
      return await this.ordersRepository.findOne({
        where: { id: order.id },
        include: [
          {
            model: OrdersOptionValues,
            include: [
              {
                model: OrderParameters,
                attributes: ['name', 'translationRu'],
              },
            ],
          },
        ],
      });
    }
    return null;
  }

  async edit({
    user,
    param,
  }: {
    user: User | undefined;
    param: Record<string, string | Record<number | string, number>>;
  }): Promise<Orders | null> {
    const shift = await this.shiftsService.getActiveShiftByUser({ user });
    const existOrder = await this.ordersRepository.findOne({
      where: { shiftId: shift?.id, companyId: user?.companyId, id: param.id },
    });
    if (existOrder && user) {
      await existOrder.deleteOptions();
      const parametersOptions = await this._formatParamToOptions(param);
      existOrder.setOptions(parametersOptions);
      await existOrder.saveOptions();
      await existOrder.update({
        totalValue: await this.priceService.calculateTotalValue({
          user,
          param,
        }),
      });
      await existOrder.save();
      return existOrder;
    }
    return null;
  }

  async fromActiveShift({
    user,
  }: {
    user: User | undefined;
  }): Promise<Orders[] | null> {
    if (user) {
      const shift = await this.shiftsService.getActiveShiftByUser({ user });
      if (shift) {
        return await this.ordersRepository.findAll({
          where: { shiftId: shift.id },
          attributes: ['id', 'totalValue', 'createdAt'],
          include: [
            {
              model: OrdersOptionValues,
              include: [
                {
                  model: OrderParameters,
                  attributes: ['name', 'type'],
                },
                {
                  model: OrderParametersOptions,
                  attributes: ['translationRu'],
                },
              ],
            },
          ],
        });
      }
    }
    return null;
  }

  async delete({
    user,
    id,
  }: {
    user: User | undefined;
    id: number;
  }): Promise<boolean> {
    const shift = await this.shiftsService.getActiveShiftByUser({ user });
    const deletedCount = await this.ordersRepository.destroy({
      where: { id, companyId: user?.companyId, shiftId: shift?.id },
    });
    return deletedCount > 0;
  }

  async _formatParamToOptions(
    param: Record<string, string | Record<number | string, number>>,
  ): Promise<Omit<OrdersOptionValuesCreationAttrs, 'orderId'>[]> {
    const parametersOptions = [] as Omit<
      OrdersOptionValuesCreationAttrs,
      'orderId'
    >[];

    for (const k in param) {
      const parameters =
        await this.orderParametersService.getParameterByName(k);
      if (parameters) {
        if (param[k]) {
          if (isObject(param[k])) {
            for (const n in param[k]) {
              parametersOptions.push({
                parameterId: parameters.id,
                value: n,
                count: param[k][n],
              });
            }
          } else {
            parametersOptions.push({
              parameterId: parameters.id,
              value: param[k],
            });
          }
        }
      }
    }
    return parametersOptions;
  }
}
