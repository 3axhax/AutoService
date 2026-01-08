import {
  AfterCreate,
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

export interface OrdersCreationAttrs {
  id?: number;
  companyId: number;
  shiftId: number;
  totalValue?: number;
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

  @HasMany(() => OrdersOptionValues)
  declare optionValues: OrdersOptionValues[];

  declare _optionsData?: Omit<OrdersOptionValuesCreationAttrs, 'orderId'>[];

  setOptions(options: Omit<OrdersOptionValuesCreationAttrs, 'orderId'>[]) {
    this._optionsData = options;
  }

  @AfterCreate
  static async createOptionValues(instance: Orders) {
    if (instance._optionsData && instance._optionsData.length > 0) {
      const optionValues = instance._optionsData.map((option) => ({
        ...option,
        orderId: instance.id,
      }));

      await OrdersOptionValues.bulkCreate(optionValues);
    }
  }
}
