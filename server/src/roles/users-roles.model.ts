import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from './roles.model';
import { User } from '../users/users.model';
import { usersRolesInitialData } from './usersRoles.initialData';

export interface UsersRolesCreationAttrs {
  roleId: number;
  userId: number;
}

@Table({
  tableName: 'users-roles',
  timestamps: false,
})
export class UserRole extends Model<UserRole, UsersRolesCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare roleId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await UserRole.count();
      if (count === 0) {
        await UserRole.bulkCreate(usersRolesInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in UserRole.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!UserRole.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await UserRole.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await UserRole.sequelize.query(
            `SELECT setval('"users-roles_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
