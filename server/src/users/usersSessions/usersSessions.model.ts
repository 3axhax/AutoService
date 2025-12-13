import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users.model';

interface UserSessionCreationAttrs {
  userId: number;
  token: string;
}

@Table({
  tableName: 'users-sessions',
  updatedAt: false,
})
export class UsersSessions extends Model<
  UsersSessions,
  UserSessionCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare token: string;
}
