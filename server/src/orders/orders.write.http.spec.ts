import {
  ConflictException,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PriceService } from '../price/price.service';
import { RolesGuard } from '../auth/roles.guard';

describe('order write boundary HTTP (isolated persistence)', () => {
  let app: INestApplication, closed: boolean;
  let build: jest.Mock, createShift: jest.Mock;
  beforeEach(async () => {
    closed = false;
    const parameter = {
      id: 8,
      name: 'works',
      type: 'SELECT_LIST',
      options: [{ id: 30 }],
    };
    const settings = {
      getAll: jest
        .fn()
        .mockResolvedValue({
          parameters: [{ ...parameter, get: () => parameter }],
          options: {},
        }),
    };
    const price = new PriceService({} as never, settings as never);
    jest
      .spyOn(price, 'getAll')
      .mockResolvedValue([
        {
          get: () => ({
            mainOptionId: 30,
            value: 100,
            conditions: [{ id: 30 }],
            discountImpact: false,
          }),
        },
      ] as never);
    let stored: unknown;
    build = jest.fn((data) => {
      stored = { ...data, id: 71, setOptions: jest.fn(), save: jest.fn() };
      return stored;
    });
    createShift = jest.fn();
    const shifts = {
      getOrCreateActiveShiftByUserCompany: createShift,
      withActiveShift: async (user, callback) => {
        if (closed) throw new ConflictException('Смена уже закрыта');
        return callback({ id: 3 }, {});
      },
    };
    const service = new OrdersService(
      { build, findOne: jest.fn(async () => stored) } as never,
      settings as never,
      shifts as never,
      price,
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
            isAdmin: false,
          };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });
  it('returns 400 for a globally known but company-disabled parameter', async () => {
    await request(app.getHttpServer())
      .post('/orders/add')
      .send({ hidden_work: { 30: 1 } })
      .expect(400);
    expect(build).not.toHaveBeenCalled();
  });
  it('returns 400 for a negative ordinary quantity', async () => {
    await request(app.getHttpServer())
      .post('/orders/add')
      .send({ works: { 30: -2 } })
      .expect(400);
    expect(build).not.toHaveBeenCalled();
  });
  it('returns 409 after close and never implicitly opens a replacement shift', async () => {
    closed = true;
    const response = await request(app.getHttpServer())
      .post('/orders/add')
      .send({ works: { 30: 2 } })
      .expect(409);
    expect(response.body.message).toBe('Смена уже закрыта');
    expect(build).not.toHaveBeenCalled();
    expect(createShift).not.toHaveBeenCalled();
  });
  it('preserves the success response and calculated quantity for a valid order', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders/add')
      .send({ works: { 30: '2' } })
      .expect(201);
    expect(response.body).toMatchObject({
      id: 71,
      companyId: 7,
      shiftId: 3,
      totalValue: 200,
      totalValueWithDiscount: 200,
    });
    expect(createShift).not.toHaveBeenCalled();
  });
});
