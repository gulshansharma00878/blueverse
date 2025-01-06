import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { Slot } from './slot';
import { WashOrder } from './wash_order';
import { Merchant } from './merchant';


export enum Status {
  Pending = 'Pending',
  Completed = 'Completed',
  Upcoming = 'Upcoming',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Started = 'Started',
}

export enum WashBy {
  Subscription = 'Subscription',
  Amount = 'Amount',
  FREE_WASH = 'free_wash',
}

@Table({ tableName: 'booking' })
export class Booking extends Model<Booking> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    field: 'booking_id',
  })
  bookingId: string;

  @ForeignKey(() => Slot)
  @Column({ type: DataType.UUID, allowNull: false, field: 'slot_id' })
  slotId: string;

  @BelongsTo(() => Slot)
  slot: Slot;

  @ForeignKey(() => Merchant)
  @Column({ type: DataType.UUID, allowNull: false, field: 'merchant_id' })
  merchantId: string;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @ForeignKey(() => WashOrder) // Foreign key reference to the WashOrder model
  @Column({ type: DataType.UUID, allowNull: false, field: 'wash_order_id' })
  washOrderId: string;

  @BelongsTo(() => WashOrder)
  washOrder: WashOrder;

  @Column({ type: DataType.STRING, allowNull: false, field: 'customer_id' })
  customerId: string;

  @Column({ type: DataType.STRING, field: 'SkuNumber' })
  SkuNumber: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'booking_time',
  })
  bookingTime: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  locked: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  lockedUntil: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'payment_status',
    defaultValue: Status.Pending,
  })
  paymentStatus: string;

  @Column({ type: DataType.FLOAT, allowNull: true, field: 'payment_amount' })
  paymentAmount: number;

  @Column({ type: DataType.UUID, allowNull: true, field: 'coupon_id' })
  couponId: string;

  @Column({ type: DataType.STRING, allowNull: true, field: 'coupon_code' })
  couponCode: string;

  @Column({ type: DataType.FLOAT, allowNull: true, field: 'coupon_amount' })
  couponAmount: number;

  @Column({ type: DataType.FLOAT, allowNull: true, field: 'transaction_id' })
  transactionId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'booking_status',
    defaultValue: Status.Pending,
  })
  bookingStatus: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    field: 'cancellation_amount',
  })
  cancellationAmount: number;

  @Column({ type: DataType.FLOAT, allowNull: true, field: 'one_time_password' })
  oneTimePassword: number;

  @Column({
    type: DataType.ENUM(...Object.values(WashBy)),
    allowNull: true,
    field: 'wash_by',
  })
  washBy: string;

  @Column({
    type: DataType.JSONB,
    field: 'wash_wallet_balance',
    allowNull: true,
  })
  washWalletBalance: {};

  static async countBookingsForSlot(slotId: string): Promise<number> {
    const count = await Booking.count({ where: { slotId } });
    return count;
  }
}
