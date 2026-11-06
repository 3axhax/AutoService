import { OrdersService } from './orders.service';
import { ShiftsService } from '../shifts/shifts.service';
import { AdditionalWorks } from '../additionalWorks/additionalWorks.model';
import { DownloadExcelService } from '../downloadExcel/downloadExcel.service';
import { Workbook } from 'exceljs';
import { Op } from 'sequelize';

const user = { id: 7, companyId: 3 };

describe('worker shift export', () => {
  const shifts = { getExportShiftIds: jest.fn(), getShiftByUserAndId: jest.fn() };
  const repo = { findAll: jest.fn() };
  const excel = { downloadData: jest.fn() };
  let service: OrdersService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(repo as never, { getAll: jest.fn().mockResolvedValue({ parameters: [] }) } as never, shifts as never, {} as never, excel as never);
    repo.findAll.mockResolvedValue([]);
    jest.spyOn(AdditionalWorks, 'findAll').mockResolvedValue([]);
  });
  afterEach(() => jest.restoreAllMocks());
  it('exports all selected owned shift ids without pagination and includes a separate additional work sheet', async () => {
    shifts.getExportShiftIds.mockResolvedValue([11, 12]);
    await service.downloadWorkerList({ user: user as never, res: {} as never, param: {} as never });
    expect(shifts.getExportShiftIds).toHaveBeenCalledWith(user, {});
    const where = repo.findAll.mock.calls[0][0].where[Op.and];
    expect(where[0]).toEqual({ companyId: 3 });
    expect(where[1]).toEqual({ shiftId: { [Op.in]: [11, 12] } });
    expect(repo.findAll.mock.calls[0][0].limit).toBeUndefined();
    expect(AdditionalWorks.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: 3, shiftId: { [Op.in]: [11, 12] } } }));
    const { data, additionalData } = excel.downloadData.mock.calls[0][0];
    const buffer = await new DownloadExcelService().generateExcel(data, additionalData);
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer as never);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Заказы', 'Дополнительные работы']);
  });
  it('writes additional work values to the separate worksheet', async () => {
    shifts.getShiftByUserAndId.mockResolvedValue({ id: 42 });
    (AdditionalWorks.findAll as jest.Mock).mockResolvedValue([{ id: 4, shiftId: 42, description: 'Test work', totalValue: 250, getDataValue: () => new Date('2026-11-05T12:00:00Z') }]);
    await service.downloadWorkerList({ user: user as never, res: {} as never, param: { shiftId: 42 } as never });
    const { data, additionalData } = excel.downloadData.mock.calls[0][0];
    const workbook = new Workbook();
    await workbook.xlsx.load(await new DownloadExcelService().generateExcel(data, additionalData) as never);
    const sheet = workbook.getWorksheet('Дополнительные работы')!;
    expect(sheet.getCell('B2').value).toBe(42);
    expect(sheet.getCell('D2').value).toBe('Test work');
    expect(sheet.getCell('D2').alignment.wrapText).toBe(true);
    expect(sheet.getCell('A2').alignment.wrapText).toBe(true);
    expect(sheet.getCell('E2').value).toBe(250);
  });
  it('rejects another worker or company shift before reading orders', async () => {
    shifts.getShiftByUserAndId.mockResolvedValue(null);
    await expect(service.downloadWorkerList({ user: user as never, res: {} as never, param: { shiftId: 42 } as never })).rejects.toThrow('Смена не найдена');
    expect(shifts.getShiftByUserAndId).toHaveBeenCalledWith({ user, shiftId: 42 });
    expect(repo.findAll).not.toHaveBeenCalled();
    expect(AdditionalWorks.findAll).not.toHaveBeenCalled();
  });
  it('uses only a chosen owned shift independently of the date filter', async () => {
    shifts.getShiftByUserAndId.mockResolvedValue({ id: 42 });
    await service.downloadWorkerList({ user: user as never, res: {} as never, param: { shiftId: 42 } as never });
    expect(shifts.getExportShiftIds).not.toHaveBeenCalled();
    expect(repo.findAll.mock.calls[0][0].where[Op.and][1]).toEqual({ shiftId: { [Op.in]: [42] } });
  });
  it('selects shift ids for the authenticated owner and company', async () => {
    const findAll = jest.fn().mockResolvedValue([{ id: 11 }]);
    const shiftService = new ShiftsService({ findAll } as never);
    expect(await shiftService.getExportShiftIds(user as never, {} as never)).toEqual([11]);
    expect(findAll.mock.calls[0][0].where).toEqual({ companyId: 3, userId: 7 });
  });
});
