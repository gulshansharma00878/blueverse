import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import { State } from './state';
import { UserArea } from './User/UserArea';
import { STATUS } from '../module/areaModule/constant';

@Table({ tableName: 'region' })
export class Region extends Model<Region> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'region_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  regionId: string;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.INTEGER, defaultValue: STATUS.ACTIVE })
  status: number;

  @HasMany(() => State)
  state: State[];

  @HasMany(() => UserArea)
  userArea: UserArea[];
}
