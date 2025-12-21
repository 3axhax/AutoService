import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { companiesParametersOptionsInitialData } from './companiesParametersOptions.initialData';
import { Companies } from '../companies/companies.model';

export interface CompaniesParametersOptionsCreationAttrs {
  id?: number;
  companyId: number;
  parametersList?: string;
  optionsList?: string;
  parameterOptionDependence?: string;
  optionOptionDependence?: string;
}
@Table({
  tableName: 'companiesParametersOptions',
  timestamps: true,
})
export class CompaniesParametersOptions extends Model<
  CompaniesParametersOptions,
  CompaniesParametersOptionsCreationAttrs
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
    allowNull: false,
  })
  declare companyId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare parametersList: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare optionsList: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare parameterOptionDependence: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare optionOptionDependence: string;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await CompaniesParametersOptions.count();
      if (count === 0) {
        await CompaniesParametersOptions.bulkCreate(
          companiesParametersOptionsInitialData,
        );
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in orderParametersOptions.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!CompaniesParametersOptions.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await CompaniesParametersOptions.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await CompaniesParametersOptions.sequelize.query(
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
