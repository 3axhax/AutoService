import type { Transaction } from 'sequelize';
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
import { User } from '../users/users.model';

export interface OrdersCreationAttrs {
  id?: number;
  companyId: number;
  shiftId: number;
  userId: number;
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  declare userId: number;

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

  @BelongsTo(() => User)
  declare user: User;

  declare _optionsData?: Omit<OrdersOptionValuesCreationAttrs, 'orderId'>[];

  setOptions(options: Omit<OrdersOptionValuesCreationAttrs, 'orderId'>[]) {
    this._optionsData = options;
  }

  async deleteOptions(transaction?: Transaction) {
    await OrdersOptionValues.destroy({
      where: { orderId: this.id },
      transaction,
    });
  }

  async saveOptions(transaction?: Transaction) {
    if (this._optionsData && this._optionsData.length > 0) {
      const optionValues = this._optionsData.map((option) => ({
        ...option,
        orderId: this.id,
      }));

      await OrdersOptionValues.bulkCreate(optionValues, { transaction });
    }
  }

  @AfterCreate
  static async createOptionValues(
    instance: Orders,
    options: { transaction?: Transaction } = {},
  ) {
    await instance.saveOptions(options.transaction);
  }

  @BeforeDestroy
  static async destroyOptionValues(
    instance: Orders,
    options: { transaction?: Transaction } = {},
  ) {
    await OrdersOptionValues.destroy({
      where: { orderId: instance.id },
      transaction: options.transaction,
    });
  }
}
