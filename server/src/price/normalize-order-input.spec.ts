import { OrdersService } from '../orders/orders.service';
import { formatCompositeExport } from '../orders/format-composite-export';
import { normalizeOrderInput } from './normalize-order-input';
const parameters = [
  { name: 'car_type', type: 'SELECT' },
  { name: 'works', type: 'SELECT_LIST' },
  { name: 'repair', type: 'COMPOSITE_LIST' },
  { name: 'number', type: 'INPUT' },
  { name: 'signature', type: 'GRAPH_INPUT' },
];
describe('order input boundary', () => {
  it.each([
    { hidden_work: { 30: 1 } },
    { hidden_repair: [{ optionIds: [30], count: 1 }] },
    { extra: null },
  ])(
    'rejects company-disabled fields even when globally known: %j',
    (input) => {
      expect(() => normalizeOrderInput(input, parameters, false)).toThrow(
        'Недоступный параметр',
      );
      expect(() => normalizeOrderInput(input, [], false)).toThrow();
    },
  );
  it.each([-2, 1.5, 'invalid', 'Infinity', true, null])(
    'rejects invalid ordinary quantities %j',
    (count) => {
      expect(() =>
        normalizeOrderInput({ works: { 30: count } }, parameters, false),
      ).toThrow();
    },
  );
  it('uses one normalized map for calculation and persistence, with zero meaning removal', () => {
    expect(
      normalizeOrderInput({ works: { 30: '2', 31: 0 } }, parameters, false),
    ).toEqual({ works: { 30: 2 } });
    expect(
      normalizeOrderInput({ works: { 30: 0 } }, parameters, false),
    ).toEqual({});
  });
  it.each([
    { works: 30 },
    { works: [30] },
    { car_type: { 30: 1 } },
    { number: { 30: 1 } },
    { signature: 1 },
  ])('rejects the wrong parameter shape %j', (input) => {
    expect(() => normalizeOrderInput(input, parameters, false)).toThrow();
  });
  it('separates the edit ID from company parameters', () => {
    expect(() => normalizeOrderInput({ id: 12 }, parameters, false)).toThrow();
    expect(normalizeOrderInput({ id: '12' }, parameters, true)).toEqual({
      id: 12,
    });
    expect(() => normalizeOrderInput({ id: 0 }, parameters, true)).toThrow();
  });
  it('preserves numeric zero input as a stored string', () => {
    expect(normalizeOrderInput({ number: 0 }, parameters, false)).toEqual({
      number: '0',
    });
  });
  it('normalizes composite values without changing grouping', () => {
    expect(
      normalizeOrderInput(
        { repair: [{ id: 'op', optionIds: ['30', 31], count: '2' }] },
        parameters,
        false,
      ),
    ).toEqual({ repair: [{ id: 'op', optionIds: [30, 31], count: 2 }] });
  });
});

describe('composite operation identity', () => {
  it.each([
    [
      { id: 'same', optionIds: [30], count: 1 },
      { id: 'same', optionIds: [30], count: 3 },
    ],
    [
      { id: 'a'.repeat(64) + '1', optionIds: [30], count: 1 },
      { id: 'a'.repeat(64) + '2', optionIds: [30], count: 3 },
    ],
    [{ id: '', optionIds: [30], count: 1 }],
    [{ id: 123, optionIds: [30], count: 1 }],
  ])('rejects invalid or colliding IDs %j', (...operations) => {
    expect(() =>
      normalizeOrderInput({ repair: operations }, parameters, false),
    ).toThrow();
  });
  it('accepts a 64-character ID unchanged and generates missing IDs without collisions', () => {
    const id = 'a'.repeat(64);
    const normalized = normalizeOrderInput(
      {
        repair: [
          { optionIds: [30], count: 1 },
          { id: 'operation-1', optionIds: [30], count: 3 },
          { id, optionIds: [30], count: 2 },
        ],
      },
      parameters,
      false,
    );
    const operations = normalized.repair as { id: string }[];
    expect(new Set(operations.map((operation) => operation.id)).size).toBe(3);
    expect(operations[1].id).toBe('operation-1');
    expect(operations[2].id).toBe(id);
  });
});

it('preserves separate operation counts through normalization, persistence formatting and export', () => {
  const values = normalizeOrderInput(
    {
      repair: [
        { optionIds: [30], count: 1 },
        { optionIds: [30], count: 3 },
      ],
    },
    parameters,
    false,
  );
  const service = new OrdersService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const stored = service._formatParamToOptions(values, [
    { id: 15, name: 'repair', type: 'COMPOSITE_LIST' },
  ] as never);
  expect(stored[0].compositeOperationId).not.toBe(
    stored[1].compositeOperationId,
  );
  expect(formatCompositeExport(stored as never)).toBe('1. 30 × 1\n2. 30 × 3');
});
