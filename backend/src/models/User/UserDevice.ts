import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  ForeignKey,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user';

@Table({ tableName: 'user_device' })
export class UserDevice extends Model<UserDevice> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'userDeviceId' })
  userDeviceId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'userId',
  })
  userId: string;

  @Column({ type: DataTypes.TEXT, allowNull: false, field: 'deviceToken' })
  deviceToken: string;
}
