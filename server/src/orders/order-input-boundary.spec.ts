import { PriceService } from '../price/price.service';
import { OrdersService } from './orders.service';

const setup = (empty = false) => {
  const plain = empty
    ? []
    : [{ id: 8, name: 'works', type: 'SELECT_LIST', options: [{ id: 30 }] }];
  const parameters = plain.map((parameter) => ({
    ...parameter,
    get: () => parameter,
  }));
  const settings = {
    getAll: jest.fn().mockResolvedValue({ parameters, options: {} }),
    getParameterByName: jest.fn(),
  };
  const price = new PriceService({} as never, settings as never);
  jest
    .spyOn(price, 'getAll')
    .mockResolvedValue([
      {
        get: () => ({
          mainOptionId: 30,
          value: 100,
          discountImpact: false,
          conditions: [{ id: 30 }],
        }),
      },
    ] as never);
  const saved = { id: 71, setOptions: jest.fn(), save: jest.fn() };
  const repository = {
    build: jest.fn().mockReturnValue(saved),
    findOne: jest.fn().mockResolvedValue(saved),
  };
  const shifts = {
    withActiveShift: jest.fn(async (user, callback) => callback({ id: 3 }, {})),
  };
  const orders = new OrdersService(
    repository as never,
    settings as never,
    shifts as never,
    price,
    {} as never,
  );
  return { orders, repository, saved, shifts, settings };
};
describe('same company input for pricing and order writes', () => {
  it.each([false, true])(
    'rejects global/hidden parameters before any write, empty settings=%s',
    async (empty) => {
      const fixture = setup(empty),
        user = { id: 4, companyId: 7 } as never;
      await expect(
        fixture.orders.addNew({ user, param: { hidden_work: { 30: 1 } } }),
      ).rejects.toThrow('Недоступный параметр');
      await expect(
        fixture.orders.edit({
          user,
          param: { id: 71, hidden_repair: [{ optionIds: [30], count: 1 }] },
        }),
      ).rejects.toThrow('Недоступный параметр');
      expect(fixture.repository.build).not.toHaveBeenCalled();
      expect(fixture.repository.findOne).not.toHaveBeenCalled();
      expect(fixture.shifts.withActiveShift).not.toHaveBeenCalled();
      expect(fixture.settings.getParameterByName).not.toHaveBeenCalled();
    },
  );
  it.each([-2, 1.5, 'wrong'])(
    'rejects invalid count %j before mutation',
    async (count) => {
      const fixture = setup();
      await expect(
        fixture.orders.addNew({
          user: { id: 4, companyId: 7 } as never,
          param: { works: { 30: count } },
        }),
      ).rejects.toThrow();
      expect(fixture.repository.build).not.toHaveBeenCalled();
    },
  );
  it('calculates and stores the exact same positive quantity', async () => {
    const fixture = setup();
    await fixture.orders.addNew({
      user: { id: 4, companyId: 7 } as never,
      param: { works: { 30: '3' } },
    });
    expect(fixture.repository.build.mock.calls[0][0].totalValue).toBe(300);
    expect(fixture.saved.setOptions).toHaveBeenCalledWith([
      { parameterId: 8, value: '30', optionId: 30, count: 3 },
    ]);
    expect(fixture.settings.getParameterByName).not.toHaveBeenCalled();
  });
  it('omits zero counts from both price and stored values', async () => {
    const fixture = setup();
    await fixture.orders.addNew({
      user: { id: 4, companyId: 7 } as never,
      param: { works: { 30: 0 } },
    });
    expect(fixture.repository.build.mock.calls[0][0].totalValue).toBe(0);
    expect(fixture.saved.setOptions).toHaveBeenCalledWith([]);
  });
});
