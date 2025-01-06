import { machine } from 'os';
import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { State } from '../state';
import { Region } from '../region';
import { City } from '../city';
import { User } from './user';

@Table({ tableName: 'user_area' })
export class UserArea extends Model<UserArea> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'user_area_id' })
  userAreaId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'user_id',
  })
  userId: string;

  @ForeignKey(() => Region)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'region_id' })
  regionId: string;

  @ForeignKey(() => State)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'state_id' })
  stateId: string;

  @ForeignKey(() => City)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'city_id' })
  cityId: string;

  @BelongsTo(() => Region)
  region: Region;

  @BelongsTo(() => State)
  state: State;

  @BelongsTo(() => City)
  city: City;

  @BelongsTo(() => User)
  user: User;
}
