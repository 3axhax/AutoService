import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdditionalWorksController } from './additionalWorks.controller';
import { AdditionalWorksService } from './additionalWorks.service';
import { RolesGuard } from '../auth/roles.guard';

describe('additional work amount HTTP (isolated persistence)', () => {
  let app: INestApplication, create: jest.Mock, update: jest.Mock;
  beforeEach(async () => {
    const row = {
      id: 81,
      description: 'Before',
      totalValue: 90.5,
      update: undefined as unknown,
    };
    update = jest.fn(async (values) => {
      for (const [key, value] of Object.entries(values))
        if (value !== undefined) row[key] = value;
      return row;
    });
    row.update = update;
    create = jest.fn(async (data) => ({
      ...data,
      id: 81,
      totalValue: data.totalValue ?? 0,
    }));
    const service = new AdditionalWorksService(
      { create, findOne: jest.fn().mockResolvedValue(row) } as never,
      {
        withActiveShift: async (user, callback) =>
          callback({ id: 3 }, { LOCK: { UPDATE: 'UPDATE' } }),
      } as never,
    );
    const module = await Test.createTestingModule({
      controllers: [AdditionalWorksController],
      providers: [{ provide: AdditionalWorksService, useValue: service }],
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
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });
  it.each([125.75, '125.75', 100, '100', 0, '0'])(
    'preserves valid amount %j in add and edit',
    async (totalValue) => {
      const value = Number(totalValue);
      const added = await request(app.getHttpServer())
        .post('/additionalWorks/add')
        .send({ description: 'Test', totalValue })
        .expect(201);
      const edited = await request(app.getHttpServer())
        .post('/additionalWorks/edit')
        .send({ id: 81, description: 'Test', totalValue })
        .expect(201);
      expect(added.body.totalValue).toBe(value);
      expect(edited.body.totalValue).toBe(value);
      expect(create.mock.calls[0][0].totalValue).toBe(value);
      expect(update.mock.calls[0][0].totalValue).toBe(value);
    },
  );
  it.each(['not-a-number', '100junk', 'Infinity', 'NaN', true, [], {}, null])(
    'rejects malformed amount %j before add/edit writes',
    async (totalValue) => {
      await request(app.getHttpServer())
        .post('/additionalWorks/add')
        .send({ description: 'Test', totalValue })
        .expect(400);
      await request(app.getHttpServer())
        .post('/additionalWorks/edit')
        .send({ id: 81, totalValue })
        .expect(400);
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );
  it('keeps the stored amount when omitted in edit, and uses zero for an empty client input', async () => {
    const unchanged = await request(app.getHttpServer())
      .post('/additionalWorks/edit')
      .send({ id: 81, description: 'After' })
      .expect(201);
    expect(unchanged.body.totalValue).toBe(90.5);
    const zero = await request(app.getHttpServer())
      .post('/additionalWorks/edit')
      .send({ id: 81, totalValue: '' })
      .expect(201);
    expect(zero.body.totalValue).toBe(0);
    const added = await request(app.getHttpServer())
      .post('/additionalWorks/add')
      .send({ description: 'No amount' })
      .expect(201);
    expect(added.body.totalValue).toBe(0);
  });
  it.each([{}, { id: '81junk' }, { id: 1.5 }, { id: null }])(
    'rejects invalid edit IDs: %j',
    async (body) => {
      await request(app.getHttpServer())
        .post('/additionalWorks/edit')
        .send(body)
        .expect(400);
      expect(update).not.toHaveBeenCalled();
    },
  );
});
