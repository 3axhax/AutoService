import { ShiftsService } from './shifts.service';
import { OrdersService } from '../orders/orders.service';
import { AdditionalWorksService } from '../additionalWorks/additionalWorks.service';

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

function setup(closeFirst: boolean) {
  const writeStarted = deferred(),
    closeStarted = deferred(),
    releaseWrite = deferred(),
    releaseClose = deferred();
  let active = true,
    tail = Promise.resolve();
  const events: string[] = [];
  const sequelize = {
    transaction: async (callback) => {
      let release = () => {};
      const tx = {
        LOCK: { UPDATE: 'UPDATE' },
        setRelease: (fn) => {
          release = fn;
        },
      };
      try {
        return await callback(tx);
      } finally {
        release();
      }
    },
    query: async (sql, options) => {
      expect(sql).toContain('pg_advisory_xact_lock');
      expect(options.replacements).toEqual({ companyId: 7, userId: 4 });
      const previous = tail,
        waiting = deferred();
      tail = waiting.promise;
      await previous;
      options.transaction.setRelease(waiting.resolve);
    },
  };
  const shiftRepository = {
    sequelize,
    findAll: jest.fn(() =>
      Promise.resolve([{ id: 3, companyId: 7, userId: 4, active }]),
    ),
    findOne: jest.fn(async (options) =>
      options.where.active && !active
        ? null
        : { id: 3, companyId: 7, userId: 4, active },
    ),
    create: jest.fn(),
    update: jest.fn(async (values, options) => {
      expect(options.transaction).toBeDefined();
      closeStarted.resolve();
      if (closeFirst) await releaseClose.promise;
      active = false;
      events.push('close');
      return [1];
    }),
  };
  const shifts = new ShiftsService(shiftRepository as never);
  const user = { id: 4, companyId: 7, isAdmin: false } as never;
  const write = async () => {
    writeStarted.resolve();
    if (!closeFirst) await releaseWrite.promise;
    expect(active).toBe(true);
    events.push('write');
    return 1;
  };
  const order = {
    id: 71,
    shiftId: 3,
    setOptions: jest.fn(),
    save: write,
    deleteOptions: jest.fn(),
    saveOptions: write,
    update: jest.fn(),
  };
  const orders = new OrdersService(
    {
      findOne: jest.fn().mockResolvedValue(order),
      findAll: jest.fn().mockResolvedValue([order]),
      build: jest.fn().mockReturnValue(order),
      destroy: write,
    } as never,
    {} as never,
    shifts,
    {
      prepareOrder: jest.fn(async ({ param }) => ({
        values: param,
        parameters: [],
        totalValue: 100,
        totalValueWithDiscount: 100,
      })),
    } as never,
    {} as never,
  );
  const work = { id: 81, update: write };
  const works = new AdditionalWorksService(
    {
      create: write,
      findOne: jest.fn().mockResolvedValue(work),
      destroy: write,
    } as never,
    shifts,
  );
  const operations = {
    addOrder: () => orders.addNew({ user, param: {} }),
    editOrder: () => orders.edit({ user, param: { id: 71 } }),
    deleteOrder: () => orders.delete({ user, id: 71 }),
    deleteOrderBatch: () => orders.delete({ user, id: [71] }),
    addWork: () =>
      works.addNew({ user, param: { description: 'test', totalValue: 100 } }),
    editWork: () =>
      works.edit({
        user,
        param: { id: 81, description: 'test', totalValue: 100 },
      }),
    deleteWork: () => works.delete({ user, id: 81 }),
  };
  return {
    operations,
    close: () => shifts.closeAllActiveShiftByUser({ user }),
    writeStarted,
    closeStarted,
    releaseWrite,
    releaseClose,
    events,
    shiftRepository,
  };
}
const kinds = [
  'addOrder',
  'editOrder',
  'deleteOrder',
  'deleteOrderBatch',
  'addWork',
  'editWork',
  'deleteWork',
] as const;
describe('shift close versus writes', () => {
  it.each(kinds)(
    'lets an already locked %s finish before closing',
    async (kind) => {
      const fixture = setup(false);
      const writing = fixture.operations[kind]();
      await fixture.writeStarted.promise;
      let closed = false;
      const closing = fixture.close().then(() => {
        closed = true;
      });
      await tick();
      expect(closed).toBe(false);
      fixture.releaseWrite.resolve();
      await writing;
      await closing;
      expect(fixture.events).toEqual(['write', 'close']);
      expect(fixture.shiftRepository.create).not.toHaveBeenCalled();
    },
  );
  it.each(kinds)(
    'rejects %s after close wins without creating another shift',
    async (kind) => {
      const fixture = setup(true);
      const closing = fixture.close();
      await fixture.closeStarted.promise;
      const writing = fixture.operations[kind]();
      // Attach rejection handler before releasing the winner.
      const outcome = expect(writing).rejects.toMatchObject({ status: 409 });
      await tick();
      expect(fixture.events).toEqual([]);
      fixture.releaseClose.resolve();
      await closing;
      await outcome;
      expect(fixture.events).toEqual(['close']);
      expect(fixture.shiftRepository.create).not.toHaveBeenCalled();
    },
  );
});
