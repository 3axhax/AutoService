import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { RolesGuard } from '../auth/roles.guard';
import { Op } from 'sequelize';
import { Server } from 'http';
import { Response } from 'express';
import { ExcelTableData } from '../downloadExcel/downloadExcel.types';
import { DownloadExcelService } from '../downloadExcel/downloadExcel.service';
import { Workbook } from 'exceljs';
import { IncomingMessage } from 'http';

describe('orders list/export filter validation HTTP (isolated data)', () => {
  let emptyParameters: boolean;
  let app: INestApplication,
    repository: { findAll: jest.Mock; count: jest.Mock },
    download: jest.Mock;
  beforeEach(async () => {
    emptyParameters = false;
    const plain = {
      id: 71,
      createdAt: new Date('2026-11-03'),
      totalValue: 125.75,
      totalValueWithDiscount: 125.75,
      user: { id: 4, name: 'Test' },
      shift: { user: { name: 'Test' } },
      optionValues: [
        {
          parameterId: 4,
          parameter: { name: 'car_number', type: 'INPUT' },
          value: 'TEST',
          count: 1,
        },
      ],
    };
    repository = {
      findAll: jest.fn().mockResolvedValue([{ ...plain, get: () => plain }]),
      count: jest.fn().mockResolvedValue(1),
    };
    const parameters = [
      { id: 4, name: 'car_number', translationRu: 'Car', type: 'INPUT' },
      {
        id: 11,
        name: 'signature',
        translationRu: 'Signature',
        type: 'GRAPH_INPUT',
      },
    ];
    download = jest.fn(
      ({ res, data }: { res: Response; data: ExcelTableData }) =>
        Promise.resolve(
          res.status(200).json({ exportedRows: data.rows.length }),
        ),
    );
    const service = new OrdersService(
      repository as never,
      {
        getAll: jest.fn(() =>
          Promise.resolve({ parameters: emptyParameters ? [] : parameters }),
        ),
        getParameterByName: (name: string) =>
          Promise.resolve(
            parameters.find((parameter) => parameter.name === name),
          ),
      } as never,
      {} as never,
      {} as never,
      { downloadData: download } as never,
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
            isAdmin: true,
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
  it.each([false, true])(
    'returns a real base-column workbook with no parameter dictionary, empty rows=%s',
    async (emptyRows) => {
      emptyParameters = true;
      if (emptyRows) repository.findAll.mockResolvedValue([]);
      download.mockImplementation(
        (args: { res: Response; data: ExcelTableData }) =>
          new DownloadExcelService().downloadData(args),
      );
      const response = await request(app.getHttpServer() as Server)
        .post('/orders/downloadList')
        .send({ filters: [] })
        .buffer(true)
        .parse(
          (
            res: IncomingMessage,
            callback: (err: Error | null, body?: Buffer) => void,
          ) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(chunks)));
            res.on('error', callback);
          },
        )
        .timeout({ response: 1500, deadline: 3000 })
        .expect(201)
        .expect('Content-Type', /spreadsheetml/);
      const workbook = new Workbook();
      await workbook.xlsx.load(response.body as never);
      const sheet = workbook.worksheets[0];
      expect((sheet.getRow(1).values as unknown[]).slice(1)).toEqual([
        '№',
        'Дата создания',
        'Работник',
        'Сумма, ₽',
        'Сумма со скидкой, ₽',
      ]);
      expect(sheet.rowCount).toBe(emptyRows ? 1 : 2);
      if (!emptyRows) expect(sheet.getCell('D2').value).toBe(125.75);
    },
  );
  it.each([
    {},
    { filters: [] },
    { filters: [{ filterName: 'car_number', filterValue: 'TEST' }] },
    { filters: [{ filterName: 'signature', filterValue: null }] },
  ])(
    'accepts absent/valid filters consistently for list and export: %j',
    async (body) => {
      const result = await request(app.getHttpServer() as Server)
        .post('/orders/getForAdmin')
        .send(body)
        .expect(201);
      expect(result.body).toMatchObject({ currentPage: 1, totalRecord: 1 });
      expect((result.body as { rows: unknown[] }).rows).toHaveLength(1);
      await request(app.getHttpServer() as Server)
        .post('/orders/downloadList')
        .send(body)
        .expect(200, { exportedRows: 1 });
    },
  );
  it.each([
    null,
    {},
    'bad',
    [null],
    [[]],
    [1],
    [{ filterName: 'car_number' }],
    [{ filterName: 4, filterValue: 'TEST' }],
    [{ filterName: '', filterValue: 'TEST' }],
    [{ filterName: 'car_number', filterValue: {} }],
    [{ filterName: 'car_number', filterValue: false }],
  ])(
    'rejects invalid filters before list/export queries: %j',
    async (filters) => {
      for (const path of ['getForAdmin', 'downloadList'])
        await request(app.getHttpServer() as Server)
          .post('/orders/' + path)
          .send({ filters })
          .expect(400);
      expect(repository.findAll).not.toHaveBeenCalled();
      expect(repository.count).not.toHaveBeenCalled();
      expect(download).not.toHaveBeenCalled();
    },
  );
  it.each([
    ['userId', 'not-an-id'],
    ['userId', 'Infinity'],
    ['userId', '4junk'],
    ['userId', 1.5],
    ['userId', 0],
    ['userId', -1],
    ['userId', Number.MAX_SAFE_INTEGER + 1],
    ['createdAtStart', 'bad-date'],
    ['createdAtEnd', '31.02.2026'],
    ['createdAtEnd', '29.02.2025'],
    ['createdAtStart', '03junk.11.2026'],
    ['createdAtEnd', 20261103],
  ])(
    'rejects invalid service filter %s=%s before queries',
    async (filterName, filterValue) => {
      for (const path of ['getForAdmin', 'downloadList'])
        await request(app.getHttpServer() as Server)
          .post('/orders/' + path)
          .send({ filters: [{ filterName, filterValue }] })
          .expect(400);
      expect(repository.findAll).not.toHaveBeenCalled();
      expect(repository.count).not.toHaveBeenCalled();
    },
  );

  it.each([4, '4', null])(
    'accepts a valid or cleared user filter: %s',
    async (filterValue) => {
      for (const path of ['getForAdmin', 'downloadList'])
        await request(app.getHttpServer() as Server)
          .post('/orders/' + path)
          .send({ filters: [{ filterName: 'userId', filterValue }] })
          .expect(path === 'getForAdmin' ? 201 : 200);
    },
  );

  it.each(['03.11.2026', '29.02.2024', null])(
    'accepts a calendar date or cleared interval: %s',
    async (filterValue) => {
      for (const path of ['getForAdmin', 'downloadList'])
        await request(app.getHttpServer() as Server)
          .post('/orders/' + path)
          .send({
            filters: ['createdAtStart', 'createdAtEnd'].map((filterName) => ({
              filterName,
              filterValue,
            })),
          })
          .expect(path === 'getForAdmin' ? 201 : 200);
    },
  );

  it('includes the last fractional second in list and export, excluding next midnight', async () => {
    const dates = [
      new Date(2026, 10, 2, 23, 59, 59, 999),
      new Date(2026, 10, 3, 23, 59, 59, 500),
      new Date(2026, 10, 4),
    ];
    const select = (query: {
      where: {
        [Op.and]: [
          unknown,
          {
            [Op.and]: Array<{
              createdAt: { [Op.gte]?: Date; [Op.lt]?: Date; [Op.lte]?: Date };
            }>;
          },
        ];
      };
    }) => {
      const conditions = query.where[Op.and][1][Op.and];
      expect(conditions[1].createdAt).toEqual({
        [Op.lt]: new Date(2026, 10, 4),
      });
      return dates.filter(
        (date) =>
          date >= conditions[0].createdAt[Op.gte]! &&
          date < conditions[1].createdAt[Op.lt]!,
      );
    };
    repository.findAll.mockImplementation(
      (query: Parameters<typeof select>[0]) =>
        Promise.resolve(
          select(query).map((createdAt) => {
            const plain = {
              id: 71,
              createdAt,
              totalValue: 10,
              totalValueWithDiscount: 10,
              shift: { user: { name: 'Test' } },
              optionValues: [],
            };
            return { ...plain, get: () => plain };
          }),
        ),
    );
    repository.count.mockImplementation((query: Parameters<typeof select>[0]) =>
      Promise.resolve(select(query).length),
    );
    const filters = [
      { filterName: 'createdAtStart', filterValue: '03.11.2026' },
      { filterName: 'createdAtEnd', filterValue: '03.11.2026' },
    ];
    const response = await request(app.getHttpServer() as Server)
      .post('/orders/getForAdmin')
      .send({ filters })
      .expect(201);
    expect((response.body as { totalRecord: number }).totalRecord).toBe(1);
    expect((response.body as { rows: unknown[] }).rows).toHaveLength(1);
    await request(app.getHttpServer() as Server)
      .post('/orders/downloadList')
      .send({ filters })
      .expect(200, { exportedRows: 1 });
  });
  it.each([
    { currentPage: 0 },
    { currentPage: '2junk' },
    { currentPage: 1.5 },
    { recordPerPage: 0 },
    { recordPerPage: null },
  ])(
    'rejects invalid pagination instead of silently truncating: %j',
    async (body) => {
      await request(app.getHttpServer() as Server)
        .post('/orders/getForAdmin')
        .send(body)
        .expect(400);
      expect(repository.findAll).not.toHaveBeenCalled();
    },
  );
  it('accepts whole numeric pagination strings', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/orders/getForAdmin')
      .send({ currentPage: '2', recordPerPage: '5' })
      .expect(201);
    expect((response.body as { currentPage: number }).currentPage).toBe(2);
    expect((repository.findAll.mock.calls as unknown[][])[0][0]).toMatchObject({
      limit: 5,
      offset: 5,
    });
  });
});
