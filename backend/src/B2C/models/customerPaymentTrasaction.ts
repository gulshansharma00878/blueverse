import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Customer } from './customer';
import { Booking } from './booking';
import { truncate } from 'lodash';

@Table({ tableName: 'customer_payment_transaction' })
export class CustomerPaymentTransaction extends Model<CustomerPaymentTransaction> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'payment_transaction_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  paymentTransactionId: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'transaction_id' })
  transactionId: string;

  @Column({ type: DataTypes.JSONB, field: 'webhook_response', allowNull: true })
  webhookResponse: {};

  @Column({ type: DataTypes.TEXT, field: 'generated_hash' })
  generatedHash: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'customer_id' })
  customerId: string;
  @BelongsTo(() => Customer)
  customer: Customer;

  // @ForeignKey(() => Booking)
  // @Column({ type: DataTypes.UUID, allowNull: false, field: 'booking_id' })
  // bookingId: string;

  // @BelongsTo(() => Booking)
  // booking: Booking;

  @Column({ type: DataTypes.STRING, allowNull: true })
  email: string;

  @Column({ type: DataTypes.DECIMAL(10, 2), allowNull: false })
  amount: number;

  @Column({ type: DataTypes.STRING, allowNull: true })
  phone: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  furl: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  surl: string;

  @Column({
    type: DataTypes.ENUM('FAILED', 'SUCCESS', 'PENDING', 'PROCESSING'),
    defaultValue: 'PENDING',
  })
  status: string;
}
