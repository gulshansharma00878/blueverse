import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { NotificationEngine } from './notification_engine';
import { Badge } from './badge';

// Table to store pricing terms for merchant
@Table({ tableName: 'notification_engine_badges' })
export class NotificationEngineBadge extends Model<NotificationEngineBadge> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'notification_engine_badge_id',
  })
  notificationEngineBadgeId: string;

  @ForeignKey(() => NotificationEngine)
  @Column({
    type: DataType.UUID,
    field: 'notification_engine_id',
    allowNull: false,
  })
  notificationEngineId: string;

  @ForeignKey(() => Badge)
  @Column({
    type: DataType.UUID,
    field: 'additional_service_id',
    allowNull: false,
  })
  badgeId: string;

  @BelongsTo(() => NotificationEngine)
  notificationEngine: NotificationEngine;

  @BelongsTo(() => Badge)
  badge: Badge;
}
