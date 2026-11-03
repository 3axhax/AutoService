import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Server } from 'http';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShiftsService } from '../shifts/shifts.service';
import { RolesGuard } from '../auth/roles.guard';

describe('atomic bulk order deletion (isolated persistence)', () => {
  let app: INestApplication;
  let admin: boolean, fail: boolean, closed: boolean;
  let rows: Array<{
    id: number;
    shiftId: number;
    userId: number;
    companyId: number;
  }>;
  let options: number[];
  let locks: number[];
  let destroy: jest.Mock;
  let shiftRows: Array<{
    id: number;
    userId: number;
    companyId: number;
    active: boolean;
  }>;
  beforeEach(async () => {
    admin = true;
    fail = false;
    closed = false;
    locks = [];
    rows = [
      { id: 71, shiftId: 3, userId: 4, companyId: 7 },
      { id: 72, shiftId: 4, userId: 5, companyId: 7 },
      { id: 73, shiftId: 5, userId: 6, companyId: 8 },
    ];
    options = [71, 72, 73];
    const shifts = (shiftRows = [
      { id: 4, userId: 5, companyId: 7, active: false },
      { id: 3, userId: 4, companyId: 7, active: true },
    ]);
    const transaction = { LOCK: { UPDATE: 'UPDATE' } };
    const sequelize = {
      transaction: async (
        action: (tx: typeof transaction) => Promise<unknown>,
      ) => {
        const snapshot = { rows: [...rows], options: [...options] };
        try {
          return await action(transaction);
        } catch (error) {
          rows = snapshot.rows;
          options = snapshot.options;
          throw error;
        }
      },
      query: jest.fn(
        (
          sql: string,
          params: { replacements: { userId: number }; transaction: unknown },
        ) => {
          expect(params.transaction).toBe(transaction);
          locks.push(params.replacements.userId);
          return Promise.resolve([]);
        },
      ),
    };
    const shiftService = new ShiftsService({
      sequelize,
      findAll: jest.fn(
        ({
          where,
          transaction: tx,
        }: {
          where: { id: number[]; companyId: number };
          transaction?: unknown;
        }) => {
          if (tx) expect(tx).toBe(transaction);
          return Promise.resolve(
            shifts
              .filter(
                (s) =>
                  s.companyId === where.companyId && where.id.includes(s.id),
              )
              .map((s) => ({ ...s, active: closed ? false : s.active })),
          );
        },
      ),
      findOne: jest.fn(
        ({ where }: { where: { id: number; companyId: number } }) =>
          Promise.resolve(
            shifts.find(
              (s) => s.id === where.id && s.companyId === where.companyId,
            ),
          ),
      ),
    } as never);
    type Where = {
      id: number | number[];
      companyId: number;
      shiftId?: number | number[];
      userId?: number;
    };
    const select = (where: Where) =>
      rows.filter(
        (row) =>
          row.companyId === where.companyId &&
          (Array.isArray(where.id)
            ? where.id.includes(row.id)
            : row.id === where.id) &&
          (where.shiftId === undefined ||
            (Array.isArray(where.shiftId)
              ? where.shiftId.includes(row.shiftId)
              : where.shiftId === row.shiftId)) &&
          (where.userId === undefined || row.userId === where.userId),
      );
    destroy = jest.fn(
      ({
        where,
        transaction: tx,
        individualHooks,
      }: {
        where: Where;
        transaction: unknown;
        individualHooks: boolean;
      }) => {
        expect(tx).toBe(transaction);
        expect(individualHooks).toBe(true);
        const ids = select(where).map((row) => row.id);
        rows = rows.filter((row) => !ids.includes(row.id));
        options = options.filter((id) => !ids.includes(id));
        if (fail) throw new Error('synthetic child-write failure');
        return Promise.resolve(ids.length);
      },
    );
    const service = new OrdersService(
      {
        findAll: jest.fn(
          ({
            where,
            transaction: tx,
            lock,
          }: {
            where: Where;
            transaction?: unknown;
            lock?: string;
          }) => {
            if (tx) {
              expect(tx).toBe(transaction);
              expect(lock).toBe('UPDATE');
            }
            return Promise.resolve(select(where));
          },
        ),
        findOne: jest.fn(({ where }: { where: Where }) =>
          Promise.resolve(select(where)[0]),
        ),
        destroy,
      } as never,
      {} as never,
      shiftService,
      {} as never,
      {} as never,
    );
    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest<{ user: unknown }>().user = {
            id: 4,
            companyId: 7,
            isAdmin: admin,
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });
  const remove = () =>
    request(app.getHttpServer() as Server).post('/orders/delete');
  it('deletes across active/closed shifts and owners, preserving other companies', async () => {
    await remove()
      .send({ id: [72, 71, 72] })
      .expect(201, 'true');
    expect(rows.map((row) => row.id)).toEqual([73]);
    expect(options).toEqual([73]);
    expect(locks).toEqual([4, 5]);
    expect(destroy).toHaveBeenCalledTimes(1);
  });
  it('preserves scalar compatibility', async () => {
    await remove().send({ id: '71' }).expect(201, 'true');
    expect(rows.map((row) => row.id)).toEqual([72, 73]);
  });
  it.each([
    {},
    { id: [] },
    { id: null },
    { id: [71, {}] },
    { id: [71, 1.5] },
    { id: [0] },
    { id: '71junk' },
  ])('rejects malformed IDs before deletion: %j', async (body) => {
    await remove().send(body).expect(400);
    expect(destroy).not.toHaveBeenCalled();
  });
  it.each([
    [71, 73],
    [71, 999],
  ])('does not partially delete unavailable batches: %j', async (...id) => {
    await remove().send({ id }).expect(404);
    expect(rows).toHaveLength(3);
    expect(destroy).not.toHaveBeenCalled();
  });
  it('rejects another workers shift without deleting own records', async () => {
    admin = false;
    await remove()
      .send({ id: [71, 72] })
      .expect(403);
    expect(destroy).not.toHaveBeenCalled();
  });
  it('rechecks closure after acquiring locks', async () => {
    admin = false;
    closed = true;
    await remove()
      .send({ id: [71] })
      .expect(409);
    expect(destroy).not.toHaveBeenCalled();
  });
  it('allows a worker to delete across their own active shifts', async () => {
    admin = false;
    shiftRows[0].userId = 4;
    shiftRows[0].active = true;
    rows[1].userId = 4;
    await remove()
      .send({ id: [71, 72] })
      .expect(201, 'true');
    expect(rows.map((row) => row.id)).toEqual([73]);
    expect(locks).toEqual([4]);
  });
  it('rolls back every order and child row on write failure', async () => {
    fail = true;
    await remove()
      .send({ id: [71, 72] })
      .expect(500);
    expect(rows.map((row) => row.id)).toEqual([71, 72, 73]);
    expect(options).toEqual([71, 72, 73]);
  });
});
