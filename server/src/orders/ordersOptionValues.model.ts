import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Orders } from './orders.model';
import { OrderParameters } from '../orderParameters/orderParameters.model';

export interface OrdersOptionValuesCreationAttrs {
  orderId: number;
  parameterId: number;
  count?: number;
  value: string;
}
@Table({
  tableName: 'ordersOptionValues',
  timestamps: false,
})
export class OrdersOptionValues extends Model<
  OrdersOptionValues,
  OrdersOptionValuesCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Orders)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare orderId: number;

  @ForeignKey(() => OrderParameters)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare parameterId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  declare count: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare value: string;

  @BelongsTo(() => OrderParameters, { foreignKey: 'parameterId' })
  declare parameter: OrderParameters;
}
