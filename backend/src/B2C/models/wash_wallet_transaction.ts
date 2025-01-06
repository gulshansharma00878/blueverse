import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserWashWallet } from './user_wash_wallet';
import { Booking } from './booking';
import { VehicleType } from '../models/vehicle';

// Define the enum for transaction types
export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum WashTypeConstant {
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Table({ tableName: 'wash_wallet_transaction' })
export class WashWalletTransaction extends Model<WashWalletTransaction> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    field: 'transaction_id',
  })
  washTransactionId: string;

  @ForeignKey(() => UserWashWallet)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'wallet_id' })
  washWalletId: string;

  @BelongsTo(() => UserWashWallet)
  washWallet: UserWashWallet;

  @Column({ type: DataTypes.FLOAT, allowNull: false })
  washBalance: number;

  @Column({
    type: DataTypes.ENUM(TransactionType.CREDIT, TransactionType.DEBIT),
    allowNull: false,
  })
  type: string; // Use the enum here

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
    field: 'transaction_type',
  })
  transactionType: string; // Use the enum here

  @Column({
    type: DataTypes.ENUM(...Object.values(WashTypeConstant)),
    allowNull: true,
    field: 'wash_type',
  })
  washType: string; // Use the enum here

  @Column({
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  })
  timestamp: Date;

  @ForeignKey(() => Booking)
  @Column({ type: DataTypes.UUID, allowNull: true, field: 'booking_id' })
  bookingId: string | null;

  @BelongsTo(() => Booking)
  booking: Booking | null;

  // Vehicle type for the notification
  @Column({
    type: DataTypes.ENUM(...Object.values(VehicleType)),

    field: 'vehicle_type',
  })
  vehicleType: VehicleType;
}
