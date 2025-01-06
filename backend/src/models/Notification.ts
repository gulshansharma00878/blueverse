import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User/user';

export enum MemoType {
  TAX_MEMO = 'TAX_MEMO',
  ADVANCE_MEMO = 'ADVANCE_MEMO',
}

@Table({ tableName: 'notification' })
export class Notification extends Model<Notification> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'notificationId',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  notificationId: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, field: 'userId' })
  userId: string;

  @Column({ type: DataTypes.JSONB, field: 'modelDetail', allowNull: true })
  modelDetail: {};

  // Notification Type
  @Column({
    type: DataTypes.STRING,
    field: 'type',
  })
  type: string;

  @Column({ type: DataTypes.TEXT, field: 'message' })
  message: string;

  @Column({ type: DataTypes.TEXT, field: 'link' })
  link: string;

  @Column({ type: DataTypes.BOOLEAN, defaultValue: false })
  read: boolean;

  // Identifier for memo notification(1. Advance_memo, 2. Tax_memo)
  @Column({
    type: DataTypes.ENUM(...Object.values(MemoType)),
    allowNull: true,
  })
  memoType: boolean;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  readAt: Date;

  @BelongsTo(() => User)
  user: {};
}
