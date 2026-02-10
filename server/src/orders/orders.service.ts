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
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

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
    console.warn(user);
    console.warn('isAdmin!!!', user?.isAdmin);
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

  async downloadList(res: Response) {
    const buffer = await this.generateExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');

    res.send(buffer);
  }

  async generateExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Заголовки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Имя', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Дата', key: 'date', width: 20 },
      { header: 'Подпись', key: 'sign', width: 20 },
    ];

    const data = [
      { id: 1, name: 'Vasya', email: 'mail@mail.com', date: '10-12-2015' },
      { id: 2, name: 'Petya', email: 'mail1@mail.com', date: '11-12-2015' },
      { id: 3, name: 'Misha', email: 'mail2@mail.com', date: '12-12-2015' },
    ];

    data.forEach((item, index) => {
      worksheet.addRow(item);
      console.log('Index!!!', index);
      this.addBase64ImageToCell(
        workbook,
        worksheet,
        'E',
        index + 2,
        'data:image/png;base64,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',
      );
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    return await workbook.xlsx.writeBuffer();
  }

  private base64ToBuffer(base64String: string): ExcelJS.Buffer {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    return Buffer.from(base64Data, 'base64') as unknown as ExcelJS.Buffer;
  }

  private addBase64ImageToCell(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    column: string,
    rowNumber: number,
    baseImg: string,
  ): void {
    try {
      const imageBuffer = this.base64ToBuffer(baseImg);
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      worksheet.getRow(rowNumber).height = 80;

      worksheet.getColumn(column).width = 25;
      const colNumber = worksheet.getColumn(column).number;

      worksheet.addImage(imageId, {
        tl: { col: colNumber - 1, row: rowNumber - 1 },
        ext: { width: 200, height: 100 },
      });
    } catch (error) {
      console.error('Ошибка при добавлении изображения в ячейку:', error);
      worksheet.getCell(`${column}${rowNumber}`).value = 'Изображение';
    }
  }
}
