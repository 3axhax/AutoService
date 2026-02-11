export enum ExcelCellType {
  STRING = 'STRING',
  IMG = 'IMG',
}

export interface ExcelTableHeaderData {
  name: string;
  label: string;
  width?: number;
}
export interface ExcelTableCellData {
  name: string;
  value: string | number;
  type?: ExcelCellType;
}

export interface ExcelTableData {
  header: ExcelTableHeaderData[];
  rows: ExcelTableCellData[][];
}
