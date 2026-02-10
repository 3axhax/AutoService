import {
  AfterSync,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { UserRole } from '../roles/users-roles.model';
import { userInitialData } from './users.initialData';
import { Companies } from '../companies/companies.model';

export interface UserCreationAttrs {
  email: string;
  name?: string;
  companyId?: number;
  password: string;
}
@Table({
  tableName: 'users',
})
export class User extends Model<User, UserCreationAttrs> {
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
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
  })
  declare name: string;

  @ForeignKey(() => Companies)
  @Column({
    type: DataType.INTEGER,
  })
  declare companyId: number;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      const roles = this.getDataValue('roles') as Role[];
      return (
        roles &&
        Array.isArray(roles) &&
        roles.length > 0 &&
        roles.some((role: Role) => role.value === 'ADMIN')
      );
    },
  })
  declare isAdmin: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      const roles = this.getDataValue('roles') as Role[];
      return (
        roles &&
        Array.isArray(roles) &&
        roles.length === 1 &&
        roles.some((role: Role) => role.value === 'WORKER')
      );
    },
  })
  declare isOnlyWorker: boolean;

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];

  @AfterSync
  static async addInitialData() {
    try {
      const count = await User.count();
      if (count === 0) {
        await User.bulkCreate(userInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in User.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!User.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await User.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await User.sequelize.query(
            `SELECT setval('"users_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }

  @BelongsTo(() => Companies)
  Company: Companies;
}
