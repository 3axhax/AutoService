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
import { Response } from 'express';
import { DownloadExcelService } from '../downloadExcel/downloadExcel.service';
import {
  ExcelCellType,
  ExcelTableCellData,
  ExcelTableData,
  ExcelTableHeaderData,
} from '../downloadExcel/downloadExcel.types';
import { ParametersType } from '../orderParameters/orderParametersType.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Orders)
    private ordersRepository: typeof Orders,
    private orderParametersService: OrderParametersService,
    private shiftsService: ShiftsService,
    private priceService: PriceService,
    private downloadExcelService: DownloadExcelService,
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
      const existOrder = await this.ordersRepository.findOne({ where });
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

  async downloadList({ user, res }: { user: User | undefined; res: Response }) {
    if (user) {
      const parametersList = await this.orderParametersService.getAll({ user });
      if (parametersList?.parameters && parametersList.parameters.length > 0) {
        const header: ExcelTableHeaderData[] = parametersList.parameters.reduce(
          (acc, parameter) => {
            return [
              ...acc,
              {
                name: parameter.name,
                label: parameter.translationRu,
              },
            ];
          },
          [
            { name: 'id', label: '№', width: 5 },
            { name: 'createdAt', label: 'Дата создания' },
          ],
        );
        header.push({ name: 'totalValue', label: 'Сумма, ₽' });
        header.push({
          name: 'totalValueWithDiscount',
          label: 'Сумма со скидкой, ₽',
        });
        const data: ExcelTableData = {
          header,
          rows: [],
        };
        const ordersList = await this.ordersRepository.findAll({
          where: { companyId: user.companyId },
          order: [['createdAt', 'DESC']] as Order,
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
        if (ordersList && ordersList.length > 0) {
          ordersList.forEach((order) => {
            const orderPlain = order.get({ plain: true });
            const row: ExcelTableCellData[] = [
              { name: 'id', value: orderPlain.id },
              {
                name: 'createdAt',
                value:
                  typeof orderPlain.createdAt === 'string'
                    ? new Date(orderPlain.createdAt).toLocaleString('ru-RU')
                    : '',
              },
              { name: 'totalValue', value: orderPlain.totalValue },
              {
                name: 'totalValueWithDiscount',
                value: orderPlain.totalValueWithDiscount,
              },
            ];

            if (orderPlain.optionValues && orderPlain.optionValues.length > 0) {
              orderPlain.optionValues.forEach((option) => {
                if (option.parameter) {
                  if (option.parameter.type === ParametersType.INPUT) {
                    row.push({
                      name: option.parameter.name,
                      value: option.value,
                    });
                  }
                  if (option.parameter.type === ParametersType.SELECT) {
                    row.push({
                      name: option.parameter.name,
                      value: option.option?.translationRu ?? '',
                    });
                  }
                  if (option.parameter.type === ParametersType.SELECT_LIST) {
                    if (!row.find((r) => r.name === option.parameter.name)) {
                      const listValue = orderPlain.optionValues
                        .filter(
                          (o) => o.parameter.name === option.parameter.name,
                        )
                        .map(
                          (value) =>
                            `${value.option?.translationRu} x ${value.count}`,
                        )
                        .join('\n');
                      row.push({
                        name: option.parameter.name,
                        value: listValue,
                      });
                    }
                  }
                  if (option.parameter.type === ParametersType.GRAPH_INPUT) {
                    row.push({
                      name: option.parameter.name,
                      value: option.value,
                      type: ExcelCellType.IMG,
                    });
                  }
                }
              });
            }

            data.rows.push(row);
          });
        }
        await this.downloadExcelService.downloadData({ res, data });
      }
    }
    return null;
  }
}
