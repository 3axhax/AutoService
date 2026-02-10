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
import { GetOrdersListDto } from './dto/orders.dto';
import { Shifts } from '../shifts/shifts.model';
import { Order } from 'sequelize';

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

      const { totalValue, totalValueWithDiscount } =
        await this.priceService.calculateTotalValue({
          user,
          param,
        });

      const order = this.ordersRepository.build({
        companyId: user.companyId,
        shiftId: shift.id,
        totalValue,
        totalValueWithDiscount,
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
    if (user) {
      const where = { companyId: user?.companyId, id: param.id };
      if (user.isOnlyWorker) {
        const shift = await this.shiftsService.getActiveShiftByUser({ user });
        where['shiftId'] = shift?.id;
      }
      const existOrder = await this.ordersRepository.findOne({
        where,
      });
      if (existOrder) {
        await existOrder.deleteOptions();
        const parametersOptions = await this._formatParamToOptions(param);
        existOrder.setOptions(parametersOptions);
        await existOrder.saveOptions();
        const { totalValue, totalValueWithDiscount } =
          await this.priceService.calculateTotalValue({
            user,
            param,
          });
        await existOrder.update({
          totalValue,
          totalValueWithDiscount,
        });
        await existOrder.save();
        return existOrder;
      }
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
          attributes: [
            'id',
            'totalValue',
            'totalValueWithDiscount',
            'createdAt',
          ],
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
    if (user) {
      if (user.isOnlyWorker) {
        const shift = await this.shiftsService.getActiveShiftByUser({ user });
        const deletedCount = await this.ordersRepository.destroy({
          where: { id, companyId: user?.companyId, shiftId: shift?.id },
        });
        return deletedCount > 0;
      }
      if (user.isAdmin) {
        const deletedCount = await this.ordersRepository.destroy({
          where: { id, companyId: user?.companyId },
        });
        return deletedCount > 0;
      }
    }
    return false;
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

  async getByShiftId({
    user,
    param,
  }: {
    user: User | undefined;
    param: { shiftId: number };
  }): Promise<Orders[] | null> {
    if (user) {
      const shift = user.isOnlyWorker
        ? await this.shiftsService.getShiftByUserAndId({
            user,
            shiftId: param.shiftId,
          })
        : null;
      if (shift) {
        return await this.ordersRepository.findAll({
          where: { shiftId: shift.id },
          attributes: [
            'id',
            'shiftId',
            'totalValue',
            'totalValueWithDiscount',
            'createdAt',
          ],
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

  async getForAdmin({
    user,
    param,
  }: {
    user: User | undefined;
    param: GetOrdersListDto;
  }) {
    if (user) {
      const limit = param.recordPerPage ?? 20;
      const offset = param.currentPage ? (param.currentPage - 1) * limit : 0;

      const count = await this.ordersRepository.count({
        where: { companyId: user.companyId },
      });

      const rows = await this.ordersRepository.findAll({
        where: { companyId: user.companyId },
        offset,
        limit,
        order: [['createdAt', 'DESC']] as Order,
        attributes: [
          'id',
          'shiftId',
          'totalValue',
          'totalValueWithDiscount',
          'createdAt',
        ],
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
          {
            model: Shifts,
            include: [
              {
                model: User,
                attributes: ['name'],
              },
            ],
            attributes: ['id'],
          },
        ],
      });
      console.log(count);
      return {
        totalRecord: count,
        currentPage: param.currentPage,
        rows: rows,
      };
    }
    return {
      totalRecord: 0,
      currentPage: param.currentPage,
      rows: null,
    };
  }
}
