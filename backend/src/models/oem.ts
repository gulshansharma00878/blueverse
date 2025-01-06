import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import { STATUS } from '../module/areaModule/constant';
import { User } from './User/user';

@Table({ tableName: 'oem' })
export class OEM extends Model<OEM> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'oem_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  oemId: string;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.INTEGER, defaultValue: STATUS.ACTIVE })
  status: number;

  @Column({ type: DataTypes.DATE, allowNull: true, field: 'is_deleted' })
  isDeleted: DataTypes.DateDataType;

  @HasMany(() => User)
  users: User[];
}
