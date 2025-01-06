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
import { City } from '../../models/city';
import { NotificationEngine } from './notification_engine';

@Table({ tableName: 'notification_city' })
export class NotificationCity extends Model<NotificationCity> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'notification_city_id',
  })
  notificationCityId: string;

  @ForeignKey(() => City)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'city_id' })
  cityId: string;

  @BelongsTo(() => City)
  city: City;

  @ForeignKey(() => NotificationEngine)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'notification_engine_id',
  })
  notificationEngineId: string;

  @BelongsTo(() => NotificationEngine)
  notificationEngine: NotificationEngine;
}
