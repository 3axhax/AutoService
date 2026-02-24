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
import { Op, Order, WhereOptions } from 'sequelize';
import { Response } from 'express';
import { DownloadExcelService } from '../downloadExcel/downloadExcel.service';
import {
  ExcelCellType,
  ExcelTableCellData,
  ExcelTableData,
  ExcelTableHeaderData,
} from '../downloadExcel/downloadExcel.types';
import { ParametersType } from '../orderParameters/orderParametersType.enum';
import { parseDateFromFormat } from '../utils/parseDateFromFormat';

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
      if (
        param.filters.filter(
          (filter) =>
            !['createdAtStart', 'createdAtEnd'].includes(filter.filterName),
        ).length > 0
      ) {
        const { rows, count } = await this._getOrdersListWithFilters({
          user,
          param,
        });
        return {
          totalRecord: count,
          currentPage: param.currentPage,
          rows: rows,
        };
      } else {
        return {
          totalRecord: await this.ordersRepository.count({
            where: {
              [Op.and]: [
                { companyId: user.companyId },
                param ? this._formatCreatedAtCondition(param) : {},
              ],
            },
          }),
          currentPage: param.currentPage,
          rows: await this._getOrdersList({ param, withLimits: true, user }),
        };
      }
    }
    return {
      totalRecord: 0,
      currentPage: param.currentPage,
      rows: null,
    };
  }

  async downloadList({
    user,
    res,
    param,
  }: {
    user: User | undefined;
    res: Response;
    param: GetOrdersListDto;
  }) {
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
            { name: 'user', label: 'Работник' },
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
        const ordersList =
          param.filters.filter(
            (filter) =>
              !['createdAtStart', 'createdAtEnd'].includes(filter.filterName),
          ).length > 0
            ? (
                await this._getOrdersListWithFilters({
                  user,
                  param,
                  withLimits: false,
                })
              ).rows
            : await this._getOrdersList({ user, param, withLimits: false });
        if (ordersList && ordersList.length > 0) {
          ordersList.forEach((order) => {
            const orderPlain = order.get({ plain: true });
            const row: ExcelTableCellData[] = [
              { name: 'id', value: orderPlain.id },
              {
                name: 'createdAt',
                value: this._formatDate(orderPlain.createdAt),
              },
              { name: 'totalValue', value: orderPlain.totalValue },
              {
                name: 'totalValueWithDiscount',
                value: orderPlain.totalValueWithDiscount,
              },
              {
                name: 'user',
                value: orderPlain.shift.user.name,
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

  private async _getOrdersList({
    user,
    param,
    withLimits,
  }: {
    user: User;
    param?: GetOrdersListDto;
    withLimits: boolean;
  }): Promise<Orders[]> {
    const whereCondition: WhereOptions<Orders> = {
      [Op.and]: [
        { companyId: user.companyId },
        param ? this._formatCreatedAtCondition(param) : {},
      ],
    };
    const requestParam = {
      order: [['createdAt', 'DESC']] as Order,
      where: whereCondition,
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
    };

    if (withLimits && param) {
      const limit = param.recordPerPage ?? 20;
      const offset = param.currentPage ? (param.currentPage - 1) * limit : 0;
      requestParam['limit'] = limit;
      requestParam['offset'] = offset;
    }

    return this.ordersRepository.findAll(requestParam);
  }

  private _formatDate = (date: unknown): string => {
    if (!date) return '';

    if (date instanceof Date) {
      return date.toLocaleString('ru-RU');
    }

    if (typeof date === 'string' || typeof date === 'number') {
      return new Date(date).toLocaleString('ru-RU');
    }

    return '';
  };

  private async _getOrdersListWithFilters({
    user,
    param,
    withLimits = true,
  }: {
    user: User;
    param?: GetOrdersListDto;
    withLimits?: boolean;
  }): Promise<{ rows: Orders[]; count: number }> {
    if (param?.filters) {
      const formatedFilters: {
        parameterId: number;
        filterValue: number | string | null;
        type: ParametersType;
      }[] = [];
      for (const filter of param.filters) {
        const parameter = await this.orderParametersService.getParameterByName(
          filter.filterName,
        );
        if (parameter) {
          formatedFilters.push({
            parameterId: parameter.id,
            filterValue: filter.filterValue,
            type: parameter.type,
          });
        }
      }

      if (formatedFilters.length > 0) {
        const ordersList = await this._getOrdersList({
          user,
          param,
          withLimits: false,
        });
        const totalRows: Orders[] = [];
        ordersList.forEach((order) => {
          const findingFilter = formatedFilters.reduce((acc, filter) => {
            if (
              filter.type === ParametersType.GRAPH_INPUT &&
              filter.filterValue === null &&
              !order.optionValues.some((value) => {
                return value.parameterId === filter.parameterId;
              })
            ) {
              return acc + 1;
            }
            if (
              order.optionValues.some((value) => {
                switch (filter.type) {
                  case ParametersType.SELECT:
                  case ParametersType.SELECT_LIST:
                    return (
                      value.parameterId === filter.parameterId &&
                      value.optionId &&
                      filter.filterValue &&
                      +value.optionId === +filter.filterValue
                    );
                  case ParametersType.GRAPH_INPUT:
                    return (
                      value.parameterId === filter.parameterId &&
                      filter.filterValue &&
                      +filter.filterValue > 0 &&
                      value.value !== ''
                    );
                  case ParametersType.INPUT:
                    return (
                      value.parameterId === filter.parameterId &&
                      filter.filterValue &&
                      value.value.includes(filter.filterValue.toString())
                    );
                }
              })
            ) {
              return acc + 1;
            }
            return acc;
          }, 0);
          if (findingFilter === formatedFilters.length) {
            totalRows.push(order);
          }
        });
        if (withLimits) {
          const limit = param.recordPerPage ?? 20;
          const offset = param.currentPage
            ? (param.currentPage - 1) * limit
            : 0;
          return {
            rows: totalRows.slice(offset, offset + limit),
            count: totalRows.length,
          };
        } else {
          return { rows: totalRows, count: totalRows.length };
        }
      }
    }
    return { rows: [], count: 0 };
  }

  private _formatCreatedAtCondition(
    param: GetOrdersListDto,
  ): WhereOptions<Orders> {
    if (param) {
      const createdAtStart = param.filters.find(
        (filter) => filter.filterName === 'createdAtStart',
      );
      const createdAtEnd = param.filters.find(
        (filter) => filter.filterName === 'createdAtEnd',
      );
      if (createdAtStart?.filterValue && createdAtEnd?.filterValue) {
        return {
          [Op.and]: [
            {
              createdAt: {
                [Op.gte]: parseDateFromFormat(
                  createdAtStart.filterValue.toString(),
                ),
              },
            },
            {
              createdAt: {
                [Op.lte]: parseDateFromFormat(
                  createdAtEnd.filterValue?.toString(),
                  true,
                ),
              },
            },
          ],
        };
      }
    }
    return {};
  }
}
