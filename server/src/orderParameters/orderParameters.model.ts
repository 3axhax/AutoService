import {
  AfterSync,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

import { orderParametersInitialData } from './orderParameters.initialData';
import { ParametersType } from './orderParametersType.enum';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';

export interface OrderParametersCreationAttrs {
  id?: number;
  name: string;
  type: ParametersType;
  order?: number;
  translationRu: string;
}
@Table({
  tableName: 'orderParameters',
  timestamps: true,
})
export class OrderParameters extends Model<
  OrderParameters,
  OrderParametersCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.ENUM(...Object.values(ParametersType)),
    allowNull: false,
  })
  declare type: ParametersType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare order: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare translationRu: string;

  @HasMany(() => OrderParametersOptions)
  options: OrderParametersOptions[];

  @AfterSync
  static async addInitialData() {
    try {
      const count = await OrderParameters.count();
      if (count === 0) {
        await OrderParameters.bulkCreate(orderParametersInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in orderParameters.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!OrderParameters.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await OrderParameters.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await OrderParameters.sequelize.query(
            `SELECT setval('"orderParameters_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
