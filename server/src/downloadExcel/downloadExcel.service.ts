import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { ExcelCellType, ExcelTableData } from './downloadExcel.types';

@Injectable()
export class DownloadExcelService {
  constructor() {}

  async downloadData({ res, data }: { res: Response; data: ExcelTableData }) {
    const buffer = await this.generateExcel(data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');

    res.send(buffer);
  }

  async generateExcel(data: ExcelTableData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.columns = data.header.reduce(
      (acc, head) => [
        ...acc,
        {
          key: head.name,
          header: head.label,
          width: head.width ?? 20,
          outlineLevel: 1,
        },
      ],
      [],
    );

    data.rows.forEach((row, index) => {
      const rowData = row.reduce((acc, item) => {
        if (!item.type || item.type === ExcelCellType.STRING) {
          return { ...acc, [item.name]: item.value };
        }
        return acc;
      }, {});
      const excelRow = worksheet.addRow(rowData);
      excelRow.alignment = {
        vertical: 'middle',
      };
      row.forEach((item) => {
        if (item.type === ExcelCellType.IMG) {
          data.header.forEach((headerItem, i) => {
            if (headerItem.name === item.name) {
              this.addBase64ImageToCell({
                workbook,
                worksheet,
                colNumber: i + 1,
                rowNumber: index + 2,
                baseImg:
                  typeof item.value !== 'string'
                    ? item.value.toString()
                    : item.value,
              });
            }
          });
        }
      });
    });

    worksheet.getColumn(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1c398e' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    return await workbook.xlsx.writeBuffer();
  }

  private base64ToBuffer(base64String: string): ExcelJS.Buffer {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    return Buffer.from(base64Data, 'base64') as unknown as ExcelJS.Buffer;
  }

  private addBase64ImageToCell({
    workbook,
    worksheet,
    colNumber,
    rowNumber,
    baseImg,
  }: {
    workbook: ExcelJS.Workbook;
    worksheet: ExcelJS.Worksheet;
    colNumber: number;
    rowNumber: number;
    baseImg: string;
  }): void {
    try {
      const imageBuffer = this.base64ToBuffer(baseImg);
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      worksheet.getRow(rowNumber).height = 80;

      worksheet.getColumn(colNumber).width = 25;

      worksheet.addImage(imageId, {
        tl: { col: colNumber - 1, row: rowNumber - 1 },
        ext: { width: 200, height: 100 },
      });
    } catch (error) {
      console.error('Ошибка при добавлении изображения в ячейку:', error);
    }
  }
}
