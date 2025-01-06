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
import { Machine } from './Machine/Machine';
import { Outlet } from './outlet';
import { MachineMemo } from './Machine/MachineMemo';

@Table({ tableName: 'payment_transaction' })
export class PaymentTransaction extends Model<PaymentTransaction> {
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

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'dealer_id' })
  dealerId: string;
  @BelongsTo(() => User)
  dealer: User;

  @Column({ type: DataTypes.STRING, allowNull: false })
  email: string;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'cgst',
  })
  cgst: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'sgst',
  })
  sgst: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'taxable_amount',
  })
  taxableAmount: number;

  @Column({ type: DataTypes.DECIMAL(10, 2), allowNull: false })
  amount: number;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'product_info' })
  productInfo: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  phone: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  furl: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  surl: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  username: string;

  @Column({
    type: DataTypes.ENUM('FAILED', 'SUCCESS', 'PENDING', 'PROCESSING'),
    defaultValue: 'PENDING',
  })
  status: string;

  @ForeignKey(() => MachineMemo)
  @Column({ type: DataTypes.UUID, allowNull: true, field: 'machine_memo_id' })
  machineMemoId: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'machine_id' })
  machineId: string;

  @ForeignKey(() => Outlet)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'outlet_id' })
  outletId: string;
}
