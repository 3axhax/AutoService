import { OrdersService } from './orders.service';
import { formatCompositeExport } from './format-composite-export';

describe('atomic order writes', () => {
  const setup = (failure?: string) => {
    let values = ['OLD'];
    let total = 100;
    let exists = false;
    const tx = { LOCK: { UPDATE: 'UPDATE' } };
    const record = {
      id: 71,
      shiftId: 3,
      deleteOptions: jest.fn(async (transaction) => {
        expect(transaction).toBe(tx);
        values = [];
      }),
      setOptions: jest.fn(),
      saveOptions: jest.fn(async (transaction) => {
        expect(transaction).toBe(tx);
        values = ['NEW'];
        if (failure === 'insert') throw new Error('insert failure');
      }),
      update: jest.fn(async (totals, options) => {
        expect(options.transaction).toBe(tx);
        total = totals.totalValue;
        if (failure === 'update') throw new Error('update failure');
      }),
      save: jest.fn(async (options) => {
        expect(options.transaction).toBe(tx);
        exists = true;
        await record.saveOptions(options.transaction);
      }),
    };
    const repository = {
      sequelize: {
        transaction: jest.fn(async (callback) => {
          const before = { values: [...values], total, exists };
          try {
            return await callback(tx);
          } catch (error) {
            values = before.values;
            total = before.total;
            exists = before.exists;
            throw error;
          }
        }),
      },
      findOne: jest.fn().mockResolvedValue(record),
      build: jest.fn().mockReturnValue(record),
      destroy: jest.fn(),
    };
    const liveShift = { id: 3, userId: 4, active: true };
    const shifts = {
      withActiveShift: jest.fn((user, callback) =>
        repository.sequelize.transaction((transaction) =>
          callback(liveShift, transaction),
        ),
      ),
      withLockedShift: jest.fn((target, callback) =>
        repository.sequelize.transaction((transaction) =>
          callback(liveShift, transaction),
        ),
      ),
    };
    const service = new OrdersService(
      repository as never,
      {} as never,
      shifts as never,
      {
        prepareOrder: jest.fn(async ({ param }) => ({
          totalValue: 200,
          totalValueWithDiscount: 200,
          values: param,
          parameters: [],
        })),
      } as never,
      {} as never,
    );
    jest.spyOn(service, '_formatParamToOptions').mockImplementation(() => {
      if (failure === 'format') throw new Error('format failure');
      return [];
    });
    return {
      service,
      record,
      repository,
      shifts,
      tx,
      state: () => ({ values, total, exists }),
      liveShift,
    };
  };
  it.each(['format', 'insert', 'update'])(
    'retains the old options and totals on %s failure',
    async (failure) => {
      const { service, record, state } = setup(failure);
      await expect(
        service.edit({
          user: { id: 4, companyId: 7, isAdmin: true } as never,
          param: { id: 71 },
        }),
      ).rejects.toThrow();
      expect(state()).toEqual({ values: ['OLD'], total: 100, exists: false });
      if (failure === 'format')
        expect(record.deleteOptions).not.toHaveBeenCalled();
    },
  );
  it('locks and updates all parts using one transaction', async () => {
    const { service, repository, tx, state } = setup();
    await service.edit({
      user: { id: 4, companyId: 7, isAdmin: true } as never,
      param: { id: 71 },
    });
    expect(repository.findOne).toHaveBeenLastCalledWith({
      where: { id: 71, companyId: 7, shiftId: 3 },
      transaction: tx,
      lock: 'UPDATE',
    });
    expect(state()).toMatchObject({ values: ['NEW'], total: 200 });
  });
  it('passes the create transaction to the shift, order and response query', async () => {
    const { service, repository, shifts, tx } = setup();
    await service.addNew({ user: { id: 4, companyId: 7 } as never, param: {} });
    expect(shifts.withActiveShift).toHaveBeenCalledWith(
      { id: 4, companyId: 7 },
      expect.any(Function),
    );
    expect(repository.findOne.mock.calls[0][0].transaction).toBe(tx);
  });
  it('rolls back order creation when its options cannot be inserted', async () => {
    const { service, state } = setup('insert');
    await expect(
      service.addNew({ user: { id: 4, companyId: 7 } as never, param: {} }),
    ).rejects.toThrow();
    expect(state().exists).toBe(false);
  });
  it('restricts every non-admin edit to the current user and live shift', async () => {
    const { service, repository } = setup();
    await service.edit({
      user: {
        id: 4,
        companyId: 7,
        isAdmin: false,
        isOnlyWorker: false,
      } as never,
      param: { id: 71 },
    });
    expect(repository.findOne.mock.calls[1][0].where).toEqual({
      id: 71,
      companyId: 7,
      userId: 4,
      shiftId: 3,
    });
  });
  it('rejects non-admin edits/deletes after the shift closes', async () => {
    const { service, repository, liveShift } = setup();
    liveShift.active = false;
    const user = { id: 4, companyId: 7, isAdmin: false } as never;
    await expect(service.edit({ user, param: { id: 71 } })).rejects.toThrow(
      'Смена уже закрыта',
    );
    await expect(service.delete({ user, id: 71 })).rejects.toThrow(
      'Смена уже закрыта',
    );
    expect(repository.destroy).not.toHaveBeenCalled();
  });
  it('preserves explicit admin history edits while taking the target shift lock', async () => {
    const { service, liveShift, shifts } = setup();
    liveShift.active = false;
    await service.edit({
      user: { id: 8, companyId: 7, isAdmin: true } as never,
      param: { id: 71 },
    });
    expect(shifts.withLockedShift).toHaveBeenCalledWith(
      { companyId: 7, shiftId: 3 },
      expect.any(Function),
    );
  });
});

describe('composite Excel export', () => {
  it('keeps multiple operations and their quantities in one column', () => {
    expect(
      formatCompositeExport([
        {
          compositeOperationId: 'a',
          value: '30',
          count: 2,
          option: { translationRu: 'Material A' },
        },
        {
          compositeOperationId: 'a',
          value: '31',
          count: 2,
          option: { translationRu: 'Work A' },
        },
        {
          compositeOperationId: 'b',
          value: '32',
          count: 1,
          option: { translationRu: 'Material B' },
        },
        {
          compositeOperationId: 'b',
          value: '33',
          count: 1,
          option: { translationRu: 'Work B' },
        },
      ]),
    ).toBe('1. Material A + Work A × 2\n2. Material B + Work B × 1');
  });
  it('writes the composite cell while retaining totals and ordinary input', async () => {
    const plain = {
      id: 71,
      createdAt: new Date('2026-11-03'),
      totalValue: 200,
      totalValueWithDiscount: 180,
      shift: { user: { name: 'Test' } },
      optionValues: [
        {
          parameterId: 15,
          parameter: { name: 'repair', type: 'COMPOSITE_LIST' },
          value: '30',
          count: 2,
          compositeOperationId: 'a',
          option: { translationRu: 'Repair' },
        },
        {
          parameterId: 4,
          parameter: { name: 'car_number', type: 'INPUT' },
          value: 'TEST',
          count: 1,
        },
      ],
    };
    const download = { downloadData: jest.fn() };
    const service = new OrdersService(
      { findAll: jest.fn().mockResolvedValue([{ get: () => plain }]) } as never,
      {
        getAll: jest.fn().mockResolvedValue({
          parameters: [
            {
              name: 'repair',
              translationRu: 'Repair',
              type: 'COMPOSITE_LIST',
            },
          ],
        }),
      } as never,
      {} as never,
      {} as never,
      download as never,
    );
    await service.downloadList({
      user: { companyId: 7 } as never,
      res: {} as never,
      param: { filters: [] } as never,
    });
    const row = download.downloadData.mock.calls[0][0].data.rows[0];
    expect(row).toEqual(
      expect.arrayContaining([
        { name: 'repair', value: '1. Repair × 2' },
        { name: 'car_number', value: 'TEST' },
        { name: 'totalValue', value: 200 },
        { name: 'totalValueWithDiscount', value: 180 },
      ]),
    );
    expect(row.filter((cell) => cell.name === 'repair')).toHaveLength(1);
  });
});
