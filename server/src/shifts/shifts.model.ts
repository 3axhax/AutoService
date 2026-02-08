import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Companies } from '../companies/companies.model';
import { User } from '../users/users.model';
import { Orders } from '../orders/orders.model';

export interface ShiftsCreationAttrs {
  id?: number;
  companyId: number;
  userId: number;
  active: boolean;
  closedAt?: Date | string | null;
}
@Table({
  tableName: 'shifts',
  timestamps: true,
})
export class Shifts extends Model<Shifts, ShiftsCreationAttrs> {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  declare userId: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  declare closedAt: Date | string | null;

  @HasMany(() => Orders, { foreignKey: 'shiftId' })
  declare orders: Orders[];

  @BelongsTo(() => User)
  declare user: User;
}
