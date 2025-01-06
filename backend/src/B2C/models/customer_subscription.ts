import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Customer } from './customer';
import { Subscription } from './subscription';
import { VehicleType } from '../models/vehicle';

@Table({ tableName: 'customer_subscription' })
export class CustomerSubscription extends Model<CustomerSubscription> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    field: 'customer_subscription_id',
  })
  customerSubscriptionId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'subscription_name',
  })
  subscriptionName: string;

  @ForeignKey(() => Subscription)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'subscription_id',
  })
  subscriptionId: string;

  @BelongsTo(() => Subscription)
  subscription: Subscription;

  @ForeignKey(() => Customer)
  @Column({ type: DataType.UUID, allowNull: false, field: 'customerId' })
  customerId: string;

  @BelongsTo(() => Customer)
  customer: Customer;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'price',
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    field: 'silver_wash',
    defaultValue: 0,
  })
  silverWash: number;

  @Column({
    type: DataType.INTEGER,
    field: 'gold_wash',
    defaultValue: 0,
  })
  goldWash: number;

  @Column({
    type: DataType.INTEGER,
    field: 'platinum_wash',
    defaultValue: 0,
  })
  platinumWash: number;
  @Column({
    type: DataType.INTEGER,
    field: 'remaining_silver_wash',
    defaultValue: 0,
  })
  remainingSilverWash: number;

  @Column({
    type: DataType.INTEGER,
    field: 'remaining_gold_wash',
    defaultValue: 0,
  })
  remainingGoldWash: number;

  @Column({
    type: DataType.INTEGER,
    field: 'remaining_platinum_wash',
    defaultValue: 0,
  })
  remainingPlatinumWash: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'subscription_days',
    defaultValue: 0,
  })
  subscriptionDays: number;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_expired',
    defaultValue: false,
  })
  isExpired: boolean;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'expiry_date',
  })
  expiryDate: Date;

  // Vehicle type for the notification
  @Column({
    type: DataType.ENUM(...Object.values(VehicleType)),

    field: 'vehicle_type',
  })
  vehicleType: VehicleType;
}
