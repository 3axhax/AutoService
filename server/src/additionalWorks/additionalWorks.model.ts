import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Companies } from '../companies/companies.model';
import { Shifts } from '../shifts/shifts.model';

export interface AdditionalWorksAttrs {
  id?: number;
  companyId: number;
  shiftId: number;
  description?: string;
  totalValue?: number;
}

@Table({
  tableName: 'additionalWorks',
  timestamps: true,
})
export class AdditionalWorks extends Model<
  AdditionalWorks,
  AdditionalWorksAttrs
> {
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
    type: DataType.STRING,
  })
  declare description: string;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  declare totalValue: number;
}
