import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { orderParametersOptionsInitialData } from './orderParametersOptions.initialData';
import { OrderParameters } from '../orderParameters/orderParameters.model';

export interface OrderParametersOptionsCreationAttrs {
  id?: number;
  parametersId: number;
  translationRu: string;
}
@Table({
  tableName: 'orderParametersOptions',
  timestamps: true,
})
export class OrderParametersOptions extends Model<
  OrderParametersOptions,
  OrderParametersOptionsCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => OrderParameters)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare parametersId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare translationRu: string;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await OrderParametersOptions.count();
      if (count === 0) {
        await OrderParametersOptions.bulkCreate(
          orderParametersOptionsInitialData,
        );
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in orderParametersOptions.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!OrderParametersOptions.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await OrderParametersOptions.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await OrderParametersOptions.sequelize.query(
            `SELECT setval('"orderParametersOptions_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
