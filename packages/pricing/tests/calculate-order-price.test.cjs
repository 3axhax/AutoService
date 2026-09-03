const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateOrderPrice } = require('../dist');

const parameters = [
  {
    name: 'vehicleType',
    options: [
      { id: 1, translationRu: 'Грузовой' },
      { id: 2, translationRu: 'Спецтехника' },
    ],
  },
  {
    name: 'works',
    options: [
      { id: 10, translationRu: 'Снятие колеса' },
      { id: 11, translationRu: 'Монтаж' },
    ],
  },
  {
    name: 'discount',
    options: [{ id: 20, translationRu: '10%' }],
  },
  {
    name: 'comment',
    options: [],
  },
];

test('calculates a matching price and ignores fields without options', () => {
  const result = calculateOrderPrice({
    orderValues: { vehicleType: '1', comment: '1000' },
    parameters,
    priceList: [
      { value: 500, conditions: [{ id: 1 }], discountImpact: false },
      { value: 900, conditions: [{ id: 1000 }], discountImpact: false },
    ],
  });

  assert.deepEqual(result, {
    totalValue: 500,
    totalValueWithDiscount: 500,
  });
});

test('multiplies a price by the selected option quantity', () => {
  const result = calculateOrderPrice({
    orderValues: { works: { 10: 4 } },
    parameters,
    priceList: [
      { value: 400, conditions: [{ id: 10 }], discountImpact: false },
    ],
  });

  assert.deepEqual(result, {
    totalValue: 1600,
    totalValueWithDiscount: 1600,
  });
});

test('applies a discount only to affected price rows', () => {
  const result = calculateOrderPrice({
    orderValues: { works: { 10: 2, 11: 1 }, discount: '20' },
    parameters,
    priceList: [
      { value: 500, conditions: [{ id: 10 }], discountImpact: true },
      { value: 300, conditions: [{ id: 11 }], discountImpact: false },
    ],
  });

  assert.deepEqual(result, {
    totalValue: 1300,
    totalValueWithDiscount: 1200,
  });
});

test('replaces an earlier less specific price with a matching specific row', () => {
  const result = calculateOrderPrice({
    orderValues: { vehicleType: '1', works: { 10: 2 } },
    parameters,
    priceList: [
      { value: 400, conditions: [{ id: 10 }], discountImpact: false },
      {
        value: 550,
        conditions: [{ id: 10 }, { id: 1 }],
        discountImpact: false,
      },
    ],
  });

  assert.deepEqual(result, {
    totalValue: 1100,
    totalValueWithDiscount: 1100,
  });
});

test('calculates a composite operation from the full client order state', () => {
  const result = calculateOrderPrice({
    orderValues: {
      id: -1,
      active: true,
      tire_repair: [{ id: 'repair-1', optionIds: [185, 179], count: 1 }],
    },
    parameters: [
      {
        name: 'tire_repair',
        type: 'COMPOSITE_LIST',
        options: [
          { id: 185, translationRu: 'R-10' },
          { id: 179, translationRu: 'Вулканизация холодная' },
        ],
      },
    ],
    priceList: [
      {
        value: 250,
        conditions: [{ id: 185 }],
        discountImpact: true,
        mainOptionId: 185,
      },
      {
        value: 1000,
        conditions: [{ id: 179 }, { id: 185 }],
        discountImpact: true,
        mainOptionId: 179,
      },
    ],
  });

  assert.deepEqual(result, {
    totalValue: 1250,
    totalValueWithDiscount: 1250,
  });
});
