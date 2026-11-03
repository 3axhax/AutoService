import { ShiftsService } from './shifts.service';
import { Transaction } from 'sequelize';

describe('shift isolation and creation', () => {
  it.each([false, true])('always limits company, admin=%s', async (isAdmin) => {
    const repository = {
      sequelize: {},
      count: jest.fn().mockResolvedValue(0),
      findAll: jest.fn().mockResolvedValue([]),
    };
    const service = new ShiftsService(repository as never);
    await service.getList({
      user: { id: 4, companyId: 7, isAdmin, isOnlyWorker: false } as never,
      param: { currentPage: 1, recordPerPage: 5 },
    });
    expect(repository.count).toHaveBeenCalledWith({
      where: isAdmin ? { companyId: 7 } : { companyId: 7, userId: 4 },
    });
    expect(repository.findAll.mock.calls[0][0].where).toEqual(
      isAdmin ? { companyId: 7 } : { companyId: 7, userId: 4 },
    );
  });
  it('serializes two creators across independent service instances using a transaction lock', async () => {
    let release: () => void;
    let tail = Promise.resolve();
    let row: unknown = null;
    const sequelize = {
      transaction: async (callback: (tx: Transaction) => Promise<unknown>) => {
        let unlock = () => {};
        const tx = {
          setUnlock: (fn: () => void) => {
            unlock = fn;
          },
        };
        try {
          return await callback(tx as never);
        } finally {
          unlock();
        }
      },
      query: jest.fn(
        async (
          sql: string,
          options: { transaction: { setUnlock: (fn: () => void) => void } },
        ) => {
          expect(sql).toContain('pg_advisory_xact_lock');
          const previous = tail;
          tail = new Promise<void>((resolve) => {
            release = resolve;
          });
          const currentRelease = release!;
          await previous;
          options.transaction.setUnlock(currentRelease);
        },
      ),
    };
    const repository = {
      sequelize,
      findOne: jest.fn(async () => row),
      create: jest.fn(async (data) => {
        row = { id: 9, ...data };
        return row;
      }),
    };
    const first = new ShiftsService(repository as never);
    const second = new ShiftsService(repository as never);
    const result = await Promise.all([
      first.getOrCreateActiveShiftByUserCompany({ companyId: 7, userId: 4 }),
      second.getOrCreateActiveShiftByUserCompany({ companyId: 7, userId: 4 }),
    ]);
    expect(result[0]).toBe(result[1]);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(sequelize.query).toHaveBeenCalledTimes(2);
    expect(
      sequelize.query.mock.calls.every(
        ([, options]) =>
          (
            options as never as {
              replacements: { companyId: number; userId: number };
            }
          ).replacements.companyId === 7,
      ),
    ).toBe(true);
    expect(repository.findOne.mock.calls.length).toBe(2);
  });
  it('reuses the enclosing order transaction for the lock and insert', async () => {
    const transaction = {} as Transaction;
    const repository = {
      sequelize: { query: jest.fn(), transaction: jest.fn() },
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1 }),
    };
    await new ShiftsService(
      repository as never,
    ).getOrCreateActiveShiftByUserCompany({
      companyId: 7,
      userId: 4,
      transaction,
    });
    expect(repository.sequelize.transaction).not.toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith(
      { companyId: 7, userId: 4, active: true },
      { transaction },
    );
    expect(repository.sequelize.query.mock.calls[0][1]).toMatchObject({
      transaction,
      replacements: { companyId: 7, userId: 4 },
    });
  });
});
