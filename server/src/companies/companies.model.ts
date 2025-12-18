import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { companiesInitialData } from './companies.initialData';

export interface CompaniesCreationAttrs {
  id?: number;
  fullName: string;
}
@Table({
  tableName: 'companies',
  timestamps: true,
})
export class Companies extends Model<Companies, CompaniesCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare fullName: string;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await Companies.count();
      if (count === 0) {
        await Companies.bulkCreate(companiesInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in companies.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!Companies.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await Companies.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await Companies.sequelize.query(
            `SELECT setval('"companies_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
