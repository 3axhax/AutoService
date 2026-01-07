import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Companies } from '../companies/companies.model';

export interface ShiftsCreationAttrs {
  id?: number;
  companyId: number;
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
}
