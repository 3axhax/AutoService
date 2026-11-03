import { Orders } from './orders.model';
import { OrdersOptionValues } from './ordersOptionValues.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { Transaction } from 'sequelize';
import { OrdersService } from './orders.service';
import { OrderParameters } from '../orderParameters/orderParameters.model';
import { normalizeOrderInput } from '../price/normalize-order-input';

describe('order option transaction propagation', () => {
  afterEach(() => jest.restoreAllMocks());
  it('uses explicit option IDs and propagates the transaction to insert and delete', async () => {
    const transaction = {} as Transaction;
    const lookup = jest
      .spyOn(OrderParametersOptions, 'findOne')
      .mockResolvedValue({ id: 30 } as never);
    const insert = jest
      .spyOn(OrdersOptionValues, 'bulkCreate')
      .mockResolvedValue([]);
    const remove = jest
      .spyOn(OrdersOptionValues, 'destroy')
      .mockResolvedValue(1);
    const order = {
      id: 71,
      _optionsData: [
        {
          parameterId: 15,
          value: '30',
          optionId: 30,
          count: 2,
          compositeOperationId: 'a',
        },
      ],
    } as unknown as Orders;
    await Orders.prototype.saveOptions.call(order, transaction);
    await Orders.prototype.deleteOptions.call(order, transaction);
    expect(lookup).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      [
        {
          parameterId: 15,
          value: '30',
          count: 2,
          compositeOperationId: 'a',
          optionId: 30,
          orderId: 71,
        },
      ],
      { transaction },
    );
    expect(remove).toHaveBeenCalledWith({
      where: { orderId: 71 },
      transaction,
    });
  });
  it.each(['Infinity', '1e309', '30', '0'])(
    'persists text %s without inferring option IDs, alongside real selections',
    async (text) => {
      const parameters = [
        { id: 14, name: 'text', type: 'INPUT' },
        { id: 11, name: 'signature', type: 'GRAPH_INPUT' },
        { id: 1, name: 'select', type: 'SELECT' },
        { id: 8, name: 'list', type: 'SELECT_LIST' },
        { id: 15, name: 'composite', type: 'COMPOSITE_LIST' },
      ] as OrderParameters[];
      const values = normalizeOrderInput(
        {
          text,
          signature: text,
          select: 30,
          list: { 31: 2 },
          composite: [{ id: 'a', optionIds: [32], count: 3 }],
        },
        parameters,
        false,
      );
      const formatter = new OrdersService(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
      );
      const options = formatter._formatParamToOptions(values, parameters);
      const lookup = jest
        .spyOn(OrderParametersOptions, 'findOne')
        .mockRejectedValue(new Error('text must not trigger a lookup'));
      const insert = jest
        .spyOn(OrdersOptionValues, 'bulkCreate')
        .mockResolvedValue([]);
      const transaction = {} as Transaction;
      const order = { id: 71 } as Orders;
      Orders.prototype.setOptions.call(order, options);
      await Orders.prototype.saveOptions.call(order, transaction);
      expect(lookup).not.toHaveBeenCalled();
      expect(insert).toHaveBeenCalledWith(
        [
          { orderId: 71, parameterId: 14, value: text, optionId: undefined },
          { orderId: 71, parameterId: 11, value: text, optionId: undefined },
          { orderId: 71, parameterId: 1, value: '30', optionId: 30 },
          { orderId: 71, parameterId: 8, value: '31', optionId: 31, count: 2 },
          {
            orderId: 71,
            parameterId: 15,
            value: '32',
            optionId: 32,
            count: 3,
            compositeOperationId: 'a',
          },
        ],
        { transaction },
      );
    },
  );
  it('propagates hook options to child writes', async () => {
    const transaction = {} as Transaction;
    const saveOptions = jest.fn();
    const instance = { id: 71, saveOptions } as unknown as Orders;
    await Orders.createOptionValues(instance, { transaction });
    expect(saveOptions).toHaveBeenCalledWith(transaction);
    const remove = jest
      .spyOn(OrdersOptionValues, 'destroy')
      .mockResolvedValue(1);
    await Orders.destroyOptionValues(instance, { transaction });
    expect(remove).toHaveBeenCalledWith({
      where: { orderId: 71 },
      transaction,
    });
  });
});
