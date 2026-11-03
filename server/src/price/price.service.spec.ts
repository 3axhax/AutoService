import { BadRequestException } from '@nestjs/common';
import { PriceService } from './price.service';

const makePrice = (
  mainOptionId: number,
  value: number,
  conditionIds: number[],
) => ({
  mainOptionId,
  value,
  discountImpact: true,
  conditions: conditionIds.map((id) => ({ id })),
});

describe('PriceService repair operations', () => {
  it('uses only the most specific tariff in either database order', async () => {
    const parameter = {
      id: 8,
      name: 'works',
      type: 'SELECT_LIST',
      options: [{ id: 10 }],
    };
    const category = {
      id: 1,
      name: 'category',
      type: 'SELECT',
      options: [{ id: 1 }],
    };
    const general = makePrice(10, 400, [10]);
    const specific = makePrice(10, 550, [10, 1]);
    for (const prices of [
      [general, specific],
      [specific, general],
    ]) {
      const service = new PriceService(
        {} as never,
        {
          getAll: jest
            .fn()
            .mockResolvedValue({
              parameters: [parameter, category].map((p) => ({
                ...p,
                get: () => p,
              })),
              options: {},
            }),
        } as never,
      );
      jest
        .spyOn(service, 'getAll')
        .mockResolvedValue(prices.map((p) => ({ get: () => p })) as never);
      await expect(
        service.calculateTotalValue({
          user: {} as never,
          param: { category: '1', works: { 10: 2 } },
        }),
      ).resolves.toEqual({ totalValue: 1100, totalValueWithDiscount: 1100 });
    }
  });
  const materialsParameter = {
    name: 'tire_repair',
    type: 'COMPOSITE_LIST',
    options: [
      { id: 185, translationRu: 'R-10', optionGroup: 'material' },
      { id: 198, translationRu: 'R-35', optionGroup: 'material' },
      { id: 179, translationRu: 'Холодная', optionGroup: 'work' },
      { id: 180, translationRu: 'Горячая', optionGroup: 'work' },
    ],
  };
  const parameters = [
    { ...materialsParameter, get: jest.fn(() => materialsParameter) },
  ];

  const createService = (plainPrices: ReturnType<typeof makePrice>[]) => {
    const service = new PriceService(
      null as never,
      {
        getAll: jest.fn().mockResolvedValue({ parameters, options: {} }),
      } as never,
    );
    jest
      .spyOn(service, 'getAll')
      .mockResolvedValue(
        plainPrices.map((plain) => ({ get: () => plain })) as never,
      );
    return service;
  };

  it('adds separate material and work prices once', async () => {
    const service = createService([
      makePrice(198, 800, [198]),
      makePrice(180, 2500, [180, 198]),
    ]);

    await expect(
      service.calculateTotalValue({
        user: {} as never,
        param: {
          tire_repair: [{ optionIds: [198, 180], count: 2 }],
        },
      }),
    ).resolves.toEqual({
      totalValue: 6600,
      totalValueWithDiscount: 6600,
    });
  });

  it('rejects a method without a price for the selected material', async () => {
    const service = createService([
      makePrice(185, 250, [185]),
      makePrice(179, 1000, [179, 185]),
    ]);

    await expect(
      service.calculateTotalValue({
        user: {} as never,
        param: {
          tire_repair: [{ optionIds: [185, 180], count: 1 }],
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('composite price conditions use declared positive options only', () => {
  const plain = [
    {
      id: 5,
      name: 'car_type',
      type: 'SELECT',
      options: [{ id: 12 }, { id: 13 }],
    },
    { id: 6, name: 'numeric_input', type: 'INPUT', options: [] },
    { id: 7, name: 'works', type: 'SELECT_LIST', options: [{ id: 12 }] },
    {
      id: 15,
      name: 'repair',
      type: 'COMPOSITE_LIST',
      options: [{ id: 30, optionGroup: 'work' }],
    },
  ];
  const create = () => {
    const service = new PriceService(
      null as never,
      {
        getAll: jest.fn().mockResolvedValue({
          parameters: plain.map((parameter) => ({
            ...parameter,
            get: () => parameter,
          })),
          options: {},
        }),
      } as never,
    );
    jest.spyOn(service, 'getAll').mockResolvedValue([
      {
        get: () => ({
          mainOptionId: 30,
          value: 100,
          discountImpact: false,
          conditions: [{ id: 30 }, { id: 12 }],
        }),
      },
    ] as never);
    return service;
  };
  it.each([
    { id: 12 },
    { numeric_input: 12 },
    { extra: 12 },
    { works: { 12: 0 } },
    { works: { 12: -1 } },
  ])('rejects unrelated values %j', async (extras) => {
    await expect(
      create().calculateTotalValue({
        user: {} as never,
        param: {
          car_type: 13,
          repair: [{ optionIds: [30], count: 1 }],
          ...extras,
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('accepts a real selected parent and prices the operation', async () => {
    await expect(
      create().calculateTotalValue({
        user: {} as never,
        param: {
          id: 999,
          car_type: 12,
          repair: [{ optionIds: [30], count: 2 }],
        },
      }),
    ).resolves.toEqual({ totalValue: 200, totalValueWithDiscount: 200 });
  });
  it('accepts positive quantities as real price conditions', async () => {
    await expect(
      create().calculateTotalValue({
        user: {} as never,
        param: {
          car_type: 13,
          works: { 12: 1 },
          repair: [{ optionIds: [30], count: 1 }],
        },
      }),
    ).resolves.toEqual({ totalValue: 100, totalValueWithDiscount: 100 });
  });
});
