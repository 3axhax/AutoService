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
