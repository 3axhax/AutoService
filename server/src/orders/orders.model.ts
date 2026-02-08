import {
  AfterCreate,
  BeforeDestroy,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Companies } from '../companies/companies.model';
import { Shifts } from '../shifts/shifts.model';
import {
  OrdersOptionValues,
  OrdersOptionValuesCreationAttrs,
} from './ordersOptionValues.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';

export interface OrdersCreationAttrs {
  id?: number;
  companyId: number;
  shiftId: number;
  totalValue?: number;
  totalValueWithDiscount?: number;
}

@Table({
  tableName: 'orders',
  timestamps: true,
})
export class Orders extends Model<Orders, OrdersCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Companies)
  @Column({
    type: DataType.INTEGER,
  })
  declare companyId: number;

  @ForeignKey(() => Shifts)
  @Column({
    type: DataType.INTEGER,
  })
  declare shiftId: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  declare totalValue: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  declare totalValueWithDiscount: number;

  @HasMany(() => OrdersOptionValues)
  declare optionValues: OrdersOptionValues[];

  @BelongsTo(() => Shifts)
  declare shift: Shifts;

  declare _optionsData?: Omit<
    OrdersOptionValuesCreationAttrs,
    'orderId' | 'optionId'
  >[];

  setOptions(
    options: Omit<OrdersOptionValuesCreationAttrs, 'orderId' | 'optionId'>[],
  ) {
    this._optionsData = options;
  }

  async deleteOptions() {
    await OrdersOptionValues.destroy({ where: { orderId: this.id } });
  }

  async saveOptions() {
    if (this._optionsData && this._optionsData.length > 0) {
      const optionValuesPromises = this._optionsData.map(async (option) => {
        const parametersOptions = !isNaN(+option.value)
          ? await OrderParametersOptions.findOne({
              where: { id: +option.value },
            })
          : null;
        return {
          ...option,
          optionId: parametersOptions ? parametersOptions.id : undefined,
          orderId: this.id,
        };
      });

      const optionValues = await Promise.all(optionValuesPromises);

      await OrdersOptionValues.bulkCreate(optionValues);
    }
  }

  @AfterCreate
  static async createOptionValues(instance: Orders) {
    await instance.saveOptions();
  }

  @BeforeDestroy
  static async destroyOptionValues(instance: Orders) {
    await OrdersOptionValues.destroy({ where: { orderId: instance.id } });
  }
}
