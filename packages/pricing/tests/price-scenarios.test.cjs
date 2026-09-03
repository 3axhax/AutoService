const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateOrderPrice } = require('../dist');

const optionIds = Array.from({ length: 229 }, (_, index) => index + 1);
const parameters = [
  {
    name: 'car_subtype',
    type: 'SELECT',
    options: optionIds.map((id) => ({ id, translationRu: String(id) })),
  },
  {
    name: 'type_work',
    type: 'SELECT_LIST',
    options: optionIds.map((id) => ({ id, translationRu: String(id) })),
  },
  {
    name: 'materials',
    type: 'SELECT_LIST',
    options: optionIds.map((id) => ({ id, translationRu: String(id) })),
  },
  {
    name: 'tire_repair',
    type: 'COMPOSITE_LIST',
    options: optionIds.map((id) => ({ id, translationRu: String(id) })),
  },
];
const price = (mainOptionId, value, conditions = [mainOptionId]) => ({
  mainOptionId,
  value,
  discountImpact: true,
  conditions: conditions.map((id) => ({ id })),
});

const categoryPrices = (mainOptionId, values) =>
  values.flatMap((value, index) =>
    value == null
      ? []
      : [price(mainOptionId, value, [mainOptionId, 115 + index])],
  );

const materialValues = new Map([
  [183, 450],
  [184, 650],
  [185, 250],
  [186, 300],
  [187, 300],
  [188, 350],
  [189, 350],
  [190, 350],
  [191, 400],
  [192, 450],
  [193, 450],
  [194, 450],
  [195, 550],
  [196, 650],
  [197, 600],
  [198, 800],
  [199, 900],
  [200, 950],
  [201, 1200],
  [202, 1400],
  [203, 1500],
  [204, 300],
  [205, 350],
  [206, 450],
  [207, 500],
  [208, 1200],
  [209, 1700],
  [210, 2300],
  [211, 3000],
  [212, 1000],
  [213, 1300],
  [214, 1500],
  [215, 500],
  [216, 600],
  [217, 200],
  [218, 350],
  [219, 350],
  [220, 200],
  [221, 400],
  [222, 200],
  [223, 450],
  [224, 200],
]);

const priceList = [
  ...categoryPrices(158, [400, 500, 500, 700, 1500]),
  ...categoryPrices(159, [550, 650, 650, 850, null]),
  ...categoryPrices(160, [400, 450, 500, 750, 2500]),
  ...categoryPrices(161, [550, 600, 750, 900, null]),
  ...categoryPrices(162, [400, 450, 500, 750, 2500]),
  ...categoryPrices(163, [550, 600, 750, 900, null]),
  price(164, 500),
  ...categoryPrices(165, [500, 600, 600, 750, 750]),
  ...categoryPrices(166, [400, 600, 600, 600, 600]),
  price(167, 100),
  price(168, 150),
  price(169, 250),
  price(170, 450),
  price(171, 25),
  price(172, 50),
  price(173, 100),
  ...categoryPrices(174, [500, 500, 500, 700, 700]),
  price(175, 100),
  price(176, 2000),
  price(177, 400),
  price(178, 100),
  ...[...materialValues].map(([id, value]) => price(id, value)),
  price(225, 450),
  price(226, 350),
  price(227, 100),
  price(228, 750),
  price(229, 250),
  ...[185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197].map(
    (materialId) => price(179, 1000, [179, materialId]),
  ),
  ...[198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211].map(
    (materialId) => price(179, 1200, [179, materialId]),
  ),
  ...[198, 199, 200, 201, 202, 203].map((materialId) =>
    price(180, 2500, [180, materialId]),
  ),
  ...[208, 209, 210, 211].map((materialId) =>
    price(180, 3500, [180, materialId]),
  ),
];

const order = (category, works = {}, materials = {}, tireRepair = []) => ({
  car_subtype: String(category),
  type_work: works,
  materials,
  tire_repair: tireRepair,
});
const repair = (materialOptionId, workOptionId) => ({
  optionIds: [materialOptionId, workOptionId],
  count: 1,
});

const scenarios = [
  [
    'T01',
    order(115, { 158: 4, 160: 4, 162: 4, 164: 4, 172: 4 }, { 183: 4 }),
    8800,
  ],
  [
    'T02',
    order(
      115,
      { 159: 2, 161: 2, 170: 1, 167: 2, 163: 2, 164: 2, 172: 2 },
      { 184: 2 },
    ),
    6350,
  ],
  ['T03', order(116, { 158: 6, 160: 6, 166: 6, 162: 6, 165: 1 }), 12600],
  ['T04', order(116, { 159: 2, 161: 2, 163: 2, 165: 1 }), 4300],
  ['T05', order(117, { 158: 1, 160: 1, 162: 1 }, {}, [repair(198, 180)]), 4800],
  ['T06', order(117, { 159: 2, 161: 2, 163: 2 }), 4300],
  [
    'T07',
    order(118, { 158: 2, 160: 2, 162: 2, 174: 1, 165: 1 }, {}, [
      repair(208, 180),
    ]),
    10550,
  ],
  ['T08', order(118, { 159: 2, 161: 2, 163: 2 }), 5300],
  ['T09', order(119, { 158: 4, 160: 4, 162: 4 }), 26000],
  [
    'T10',
    order(
      115,
      { 158: 1, 160: 1, 173: 1, 228: 1, 166: 1, 162: 1, 164: 1, 172: 1 },
      { 219: 1, 183: 1 },
    ),
    3800,
  ],
  [
    'T11',
    order(115, { 158: 1, 161: 1, 225: 1, 167: 1, 163: 1, 172: 1 }, { 212: 1 }),
    3100,
  ],
  [
    'T12',
    order(
      115,
      { 158: 1, 160: 1, 226: 1, 227: 1, 162: 1, 164: 1 },
      { 215: 1, 218: 1, 184: 1 },
    ),
    3650,
  ],
  [
    'T13',
    order(115, { 158: 2, 160: 2, 169: 2, 162: 2, 164: 2, 171: 12 }, { 183: 2 }),
    5100,
  ],
  ['T14', order(115, { 178: 4, 175: 4, 174: 4, 176: 2, 177: 1, 165: 1 }), 7700],
  [
    'T15',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(185, 179),
      repair(186, 179),
      repair(187, 179),
    ]),
    7450,
  ],
  [
    'T16',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(188, 179),
      repair(189, 179),
      repair(190, 179),
    ]),
    7650,
  ],
  [
    'T17',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(191, 179),
      repair(192, 179),
      repair(193, 179),
    ]),
    7900,
  ],
  [
    'T18',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(194, 179),
      repair(195, 179),
      repair(196, 179),
    ]),
    8250,
  ],
  [
    'T19',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(197, 179),
      repair(198, 180),
      repair(199, 180),
    ]),
    11900,
  ],
  [
    'T20',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(200, 180),
      repair(201, 180),
      repair(202, 180),
    ]),
    14650,
  ],
  [
    'T21',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(203, 180),
      repair(204, 179),
      repair(205, 179),
    ]),
    10650,
  ],
  [
    'T22',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(206, 179),
      repair(207, 179),
      repair(208, 180),
    ]),
    11650,
  ],
  [
    'T23',
    order(115, { 158: 3, 160: 3, 162: 3 }, {}, [
      repair(209, 180),
      repair(210, 180),
      repair(211, 180),
    ]),
    21100,
  ],
  [
    'T24',
    order(
      115,
      { 158: 3, 161: 3, 225: 3, 167: 3, 163: 3, 172: 3 },
      { 212: 1, 213: 1, 214: 1 },
    ),
    10100,
  ],
  [
    'T25',
    order(
      115,
      { 158: 4, 160: 4, 226: 2, 227: 2, 162: 4, 164: 4 },
      { 215: 1, 216: 1, 217: 1, 218: 1, 183: 4 },
    ),
    11150,
  ],
  [
    'T26',
    order(
      115,
      { 158: 3, 160: 3, 228: 3, 162: 3, 164: 3 },
      { 219: 1, 221: 1, 223: 1, 183: 3 },
    ),
    9900,
  ],
  [
    'T27',
    order(
      115,
      { 158: 3, 160: 3, 229: 3, 162: 3, 164: 3 },
      { 220: 1, 222: 1, 224: 1, 184: 3 },
    ),
    8400,
  ],
  ['T28', order(119, { 172: 8, 171: 32, 178: 8 }), 2000],
];

for (const [name, orderValues, expected] of scenarios) {
  test(`${name} calculates the documented total`, () => {
    assert.deepEqual(
      calculateOrderPrice({ orderValues, priceList, parameters }),
      {
        totalValue: expected,
        totalValueWithDiscount: expected,
      },
    );
  });
}

test('repair conditions do not multiply material and work quantities', () => {
  const result = calculateOrderPrice({
    orderValues: order(115, {}, {}, [{ optionIds: [198, 180], count: 3 }]),
    priceList,
    parameters,
  });
  assert.equal(result.totalValue, 3 * (800 + 2500));
});
