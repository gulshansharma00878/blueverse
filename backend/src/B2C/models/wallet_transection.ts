import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserWallet } from './user_wallet';
import { Booking } from './booking';
import { Subscription } from './subscription';

// Define the enum for transaction types
export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  REFUND = 'Refund',
  TOPUP = 'Wallet Top Up',
  BOOKING = 'Booking',
  FREE_WASH = 'free_wash',
  SUBSCRIPTION = 'Subscription',
  REFERRAL = 'Referral',
}

@Table({ tableName: 'wallet_transaction' })
export class WalletTransaction extends Model<WalletTransaction> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    field: 'transaction_id',
  })
  transactionId: string;

  @ForeignKey(() => UserWallet)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'wallet_id' })
  walletId: string;

  @BelongsTo(() => UserWallet)
  wallet: UserWallet;

  @Column({ type: DataTypes.FLOAT, allowNull: false })
  amount: number;

  @Column({
    type: DataTypes.ENUM(TransactionType.CREDIT, TransactionType.DEBIT),
    allowNull: false,
  })
  type: string; // Use the enum here

  @Column({
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  })
  timestamp: Date;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
    field: 'transaction_type',
  })
  transactionType: string; // Use the enum here

  @ForeignKey(() => Booking)
  @Column({ type: DataTypes.UUID, allowNull: true, field: 'booking_id' })
  bookingId: string | null;

  @BelongsTo(() => Booking)
  booking: Booking | null;

  @ForeignKey(() => Subscription)
  @Column({ type: DataTypes.UUID, allowNull: true, field: 'subscription_id' })
  subscriptionId: string | null;

  @BelongsTo(() => Subscription)
  subscription: Subscription | null;
}
