import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { roleInitialData } from './roles.initialData';
import { UserRoleEnum } from './roles.types';

export type userRoleType = UserRoleEnum;

export interface RoleCreationAttrs {
  id?: number;
  value: userRoleType;
}
@Table({
  tableName: 'roles',
  timestamps: false,
})
export class Role extends Model<Role, RoleCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM(...Object.values(UserRoleEnum)),
    unique: true,
    allowNull: false,
  })
  declare value: UserRoleEnum;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await Role.count();
      if (count === 0) {
        await Role.bulkCreate(roleInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in Role.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!Role.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await Role.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await Role.sequelize.query(
            `SELECT setval('"roles_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
