import {
  AfterSync,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { UserRole } from '../roles/users-roles.model';
import { userInitialData } from './users.initialData';

export interface UserCreationAttrs {
  email: string;
  name?: string;
  company?: number;
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

  @Column({
    type: DataType.INTEGER,
  })
  declare company: number;

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
}
