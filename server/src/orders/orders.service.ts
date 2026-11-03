import { formatCompositeExport } from './format-composite-export';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  filterException = ['userId', 'createdAtStart', 'createdAtEnd'];

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
    param: Record<string, unknown>;
  }): Promise<Orders | null> {
    if (!param || !user) return null;
    const prepared = await this.priceService.prepareOrder({
      user,
      param,
      allowId: false,
    });
    const { totalValue, totalValueWithDiscount } = prepared;
    const parametersOptions = this._formatParamToOptions(
      prepared.values,
      prepared.parameters,
    );
    return this.shiftsService.withActiveShift(
      user,
      async (shift, transaction) => {
        const order = this.ordersRepository.build({
          companyId: user.companyId,
          shiftId: shift.id,
          totalValue,
          totalValueWithDiscount,
          userId: user.id,
        });
        order.setOptions(parametersOptions);
        await order.save({ transaction });
        return this.ordersRepository.findOne({
          where: { id: order.id },
          transaction,
          include: [
            {
              model: OrdersOptionValues,
              include: [
                {
                  model: OrderParameters,
                  attributes: ['name', 'translationRu', 'type'],
                },
                {
                  model: OrderParametersOptions,
                  attributes: ['translationRu'],
                },
              ],
            },
          ],
        });
      },
    );
  }

  async edit({
    user,
    param,
  }: {
    user: User | undefined;
    param: Record<string, unknown>;
  }): Promise<Orders | null> {
    if (!user) return null;
    if (!param || param.id === undefined)
      throw new BadRequestException('Не указан id заказа');
    const prepared = await this.priceService.prepareOrder({
      user,
      param,
      allowId: true,
    });
    const where = { companyId: user.companyId, id: Number(prepared.values.id) };
    const target = await this.ordersRepository.findOne({
      where,
      attributes: ['id', 'shiftId'],
    });
    if (!target) return null;
    return this.shiftsService.withLockedShift(
      { companyId: user.companyId, shiftId: target.shiftId },
      async (shift, transaction) => {
        this.checkShiftWriteAccess(user, shift);
        if (!user.isAdmin) where['userId'] = user.id;
        where['shiftId'] = shift.id;
        const existing = await this.ordersRepository.findOne({
          where,
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!existing) return null;
        const { totalValue, totalValueWithDiscount } = prepared;
        const totals = { totalValue, totalValueWithDiscount };
        const options = this._formatParamToOptions(
          prepared.values,
          prepared.parameters,
        );
        await existing.deleteOptions(transaction);
        existing.setOptions(options);
        await existing.saveOptions(transaction);
        await existing.update(totals, { transaction });
        return existing;
      },
    );
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
    id: number | number[];
  }): Promise<boolean> {
    if (!user) return false;
    if (Array.isArray(id)) return this.deleteMany(user, id);
    const where = { id, companyId: user.companyId };
    const target = await this.ordersRepository.findOne({
      where,
      attributes: ['id', 'shiftId'],
    });
    if (!target) return false;
    return this.shiftsService.withLockedShift(
      { companyId: user.companyId, shiftId: target.shiftId },
      async (shift, transaction) => {
        this.checkShiftWriteAccess(user, shift);
        where['shiftId'] = shift.id;
        if (!user.isAdmin) where['userId'] = user.id;
        const deleted = await this.ordersRepository.destroy({
          where,
          transaction,
          individualHooks: true,
        });
        return deleted > 0;
      },
    );
  }

  private checkShiftWriteAccess(user: User, shift: Shifts) {
    if (!user.isAdmin && shift.userId !== user.id)
      throw new ForbiddenException('Чужая смена');
    if (!user.isAdmin && !shift.active)
      throw new ConflictException('Смена уже закрыта');
  }

  private async deleteMany(user: User, ids: number[]): Promise<boolean> {
    const uniqueIds = [...new Set(ids)].sort((a, b) => a - b);
    if (!uniqueIds.length) throw new BadRequestException('Не указаны заказы');
    const where = { id: uniqueIds, companyId: user.companyId };
    const targets = await this.ordersRepository.findAll({
      where,
      attributes: ['id', 'shiftId'],
    });
    if (targets.length !== uniqueIds.length)
      throw new NotFoundException('Один или несколько заказов не найдены');
    const shiftIds = [...new Set(targets.map((order) => order.shiftId))];
    return this.shiftsService.withLockedShifts(
      { companyId: user.companyId, shiftIds },
      async (shifts, transaction) => {
        for (const shift of shifts) this.checkShiftWriteAccess(user, shift);
        const lockedWhere = {
          ...where,
          shiftId: shiftIds,
          ...(!user.isAdmin ? { userId: user.id } : {}),
        };
        const orders = await this.ordersRepository.findAll({
          where: lockedWhere,
          attributes: ['id'],
          transaction,
          order: [['id', 'ASC']],
          lock: transaction.LOCK.UPDATE,
        });
        if (orders.length !== uniqueIds.length)
          throw new ConflictException(
            'Список заказов изменился или недоступен. Повторите запрос.',
          );
        const deleted = await this.ordersRepository.destroy({
          where: lockedWhere,
          transaction,
          individualHooks: true,
        });
        if (deleted !== uniqueIds.length)
          throw new ConflictException('Не удалось удалить все заказы');
        return true;
      },
    );
  }

  _formatParamToOptions(
    param: Record<string, unknown>,
    availableParameters: OrderParameters[],
  ): Omit<OrdersOptionValuesCreationAttrs, 'orderId'>[] {
    const parametersOptions = [] as Omit<
      OrdersOptionValuesCreationAttrs,
      'orderId'
    >[];

    for (const parameters of availableParameters) {
      const k = parameters.name;
      if (parameters) {
        if (param[k]) {
          if (
            parameters.type === ParametersType.COMPOSITE_LIST &&
            Array.isArray(param[k])
          ) {
            param[k].forEach((operation) => {
              if (!isObject(operation)) return;
              const compositeOperation = operation as Record<string, unknown>;
              if (typeof compositeOperation.id !== 'string')
                throw new BadRequestException(
                  'Не указан идентификатор операции',
                );
              const compositeOperationId = compositeOperation.id;
              const count = Number(compositeOperation.count ?? 1);
              if (!Array.isArray(compositeOperation.optionIds)) return;
              compositeOperation.optionIds.forEach((optionId) => {
                parametersOptions.push({
                  parameterId: parameters.id,
                  value: String(optionId),
                  optionId: Number(optionId),
                  count,
                  compositeOperationId,
                });
              });
            });
            continue;
          }
          if (isObject(param[k])) {
            for (const n in param[k]) {
              parametersOptions.push({
                parameterId: parameters.id,
                value: n,
                optionId:
                  parameters.type === ParametersType.SELECT_LIST
                    ? Number(n)
                    : undefined,
                count: Number((param[k] as Record<string, unknown>)[n]),
              });
            }
          } else {
            const scalarValue = param[k];
            if (
              typeof scalarValue !== 'string' &&
              typeof scalarValue !== 'number' &&
              typeof scalarValue !== 'boolean'
            ) {
              continue;
            }
            parametersOptions.push({
              parameterId: parameters.id,
              value: String(scalarValue),
              optionId:
                parameters.type === ParametersType.SELECT
                  ? Number(scalarValue)
                  : undefined,
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
      const shift = !user.isAdmin
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
          (filter) => !this.filterException.includes(filter.filterName),
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
        const countCondition = {
          where: {
            [Op.and]: [
              { companyId: user.companyId },
              this._formatCreatedAtCondition(param),
            ],
          },
        };
        if (param?.filters.find((filter) => filter.filterName === 'userId')) {
          countCondition['include'] = [
            {
              model: User,
              where: this._formatUserCondition(param),
              required: true,
              attributes: [],
            },
          ];
        }
        return {
          totalRecord: await this.ordersRepository.count(countCondition),
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
      const parameters = parametersList?.parameters ?? [];
      const header: ExcelTableHeaderData[] = parameters.reduce(
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
          (filter) => !this.filterException.includes(filter.filterName),
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
                      .filter((o) => o.parameter.name === option.parameter.name)
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
                if (
                  option.parameter.type === ParametersType.COMPOSITE_LIST &&
                  !row.some((cell) => cell.name === option.parameter.name)
                ) {
                  row.push({
                    name: option.parameter.name,
                    value: formatCompositeExport(
                      orderPlain.optionValues.filter(
                        (value) => value.parameterId === option.parameterId,
                      ),
                    ),
                  });
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
        this._formatCreatedAtCondition(param),
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
          attributes: ['id', 'userId'],
        },
        {
          model: User,
          where: this._formatUserCondition(param),
          attributes: ['id', 'name'],
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
    param: GetOrdersListDto | undefined,
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
                [Op.lt]: parseDateFromFormat(
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
  private _formatUserCondition(
    param: GetOrdersListDto | undefined,
  ): WhereOptions<User> {
    const userIdFilter = param?.filters.find(
      (filter) => filter.filterName === 'userId',
    );
    if (userIdFilter?.filterValue) {
      return { id: +userIdFilter.filterValue };
    }
    return {};
  }
}
