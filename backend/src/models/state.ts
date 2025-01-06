import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Region } from './region';
import { City } from './city';
import { STATUS } from '../module/areaModule/constant';
import { UserArea } from './User/UserArea';

@Table({ tableName: 'state' })
export class State extends Model<State> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'state_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  stateId: string;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  stateGstNo: string;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  blueverseAddress: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  blueverseEmail: string;

  @Column({ type: DataTypes.INTEGER, defaultValue: STATUS.ACTIVE })
  status: number;

  @ForeignKey(() => Region)
  @Column({ type: DataTypes.UUID, field: 'region_id' })
  regionId: string;

  @BelongsTo(() => Region)
  region: Region;

  @HasMany(() => City)
  cities: City[];

  @HasMany(() => UserArea)
  userArea: UserArea[];
}
