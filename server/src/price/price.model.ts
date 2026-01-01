import {
  AfterSync,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { priceInitialData } from './price.initialData';
import { Companies } from '../companies/companies.model';
import { PriceParametersOptionConditions } from './priceParametersOptionConditions.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';

export interface PriceCreationAttrs {
  id?: number;
  companyId: number;
  value: number;
  discountImpact: boolean;
}
@Table({
  tableName: 'price',
  timestamps: true,
})
export class Price extends Model<Price, PriceCreationAttrs> {
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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare value: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare discountImpact: boolean;

  @BelongsToMany(
    () => OrderParametersOptions,
    () => PriceParametersOptionConditions,
  )
  conditions: OrderParametersOptions[];

  @AfterSync
  static async addInitialData() {
    try {
      const count = await Price.count();
      if (count === 0) {
        await Price.bulkCreate(priceInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in price.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!Price.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await Price.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await Price.sequelize.query(
            `SELECT setval('"price_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
