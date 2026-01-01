import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { priceParametersOptionConditionsInitialData } from './priceParametersOptionConditions.initialData';
import { Price } from './price.model';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';

export interface PriceParametersOptionConditionsCreationAttrs {
  priceId: number;
  optionId: number;
}

@Table({
  tableName: 'priceParametersOptionConditions',
  timestamps: false,
})
export class PriceParametersOptionConditions extends Model<
  PriceParametersOptionConditions,
  PriceParametersOptionConditionsCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Price)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare priceId: number;

  @ForeignKey(() => OrderParametersOptions)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare optionId: number;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await PriceParametersOptionConditions.count();
      if (count === 0) {
        await PriceParametersOptionConditions.bulkCreate(
          priceParametersOptionConditionsInitialData,
        );
      }
      await this.updateSequence();
    } catch (error) {
      console.error(
        'Error in ParametersOptionConditions.addInitialData:',
        error,
      );
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!PriceParametersOptionConditions.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await PriceParametersOptionConditions.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await PriceParametersOptionConditions.sequelize.query(
            `SELECT setval('"parametersOptionConditions_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
