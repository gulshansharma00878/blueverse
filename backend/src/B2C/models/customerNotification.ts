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
import { Customer } from './customer';

@Table({ tableName: 'customer_notification' })
export class CustomerNotification extends Model<CustomerNotification> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'customer_notification_id',
  })
  customerNotificationId: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'customer_id' })
  customerId: string;

  @BelongsTo(() => Customer)
  customer: Customer;

  @Column({ allowNull: false, type: DataTypes.TEXT, field: 'description' })
  description: string;

  @Column({ allowNull: false, type: DataTypes.STRING, field: 'title' })
  title: string;

  @Column({ allowNull: true, type: DataTypes.STRING, field: 'image_url' })
  imageUrl: string;

  @Column({ allowNull: true, type: DataTypes.STRING, field: 'redirect_url' })
  redirectUrl: string;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
    field: 'is_read',
    defaultValue: false,
  })
  isRead: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
    field: 'is_cancel',
    defaultValue: false,
  })
  isCancel: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
    field: 'is_merchant_closure',
    defaultValue: false,
  })
  isMerchantClosure: boolean;
}
