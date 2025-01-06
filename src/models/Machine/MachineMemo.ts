import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { Machine } from './Machine';
import { User } from '../User/user';
import { Outlet } from '../outlet';
import { PaymentTransaction } from '../payment_transactions';
import { OutletMachine } from '../outlet_machine';

@Table({ tableName: 'machine_memo' })
export class MachineMemo extends Model<MachineMemo> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'machine_memo_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  machineMemoId: string;

  @Column({ type: DataTypes.STRING, field: 'memo_id' })
  memoId: string;

  @ForeignKey(() => Machine)
  @Column({
    type: DataTypes.UUID,
    field: 'machine_id',
    allowNull: false,
  })
  machineId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'dealer_id',
    allowNull: false,
  })
  dealerId: string;

  @Column({
    type: DataTypes.DATE,
    field: 'due_date',
  })
  dueDate: Date;

  @Column({ type: DataTypes.STRING, allowNull: false })
  month: string;

  @Column({
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'FAILED', 'PAID'),
    defaultValue: 'PENDING',
  })
  status: string;

  @Column({
    type: DataTypes.ENUM(
      'ADVANCE_MEMO',
      'TOPUP_MEMO',
      'TAX_INVOICE',
      'BLUEVERSE_CREDIT'
    ),
    defaultValue: 'ADVANCE_MEMO',
  })
  type: string;

  @ForeignKey(() => Outlet)
  @Column({
    type: DataTypes.UUID,
    field: 'outlet_id',
    allowNull: false,
  })
  outletId: string;

  @Column({
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'minimum_wash_commitment',
  })
  minimumWashCommitment: number;

  @Column({ type: DataTypes.JSONB, field: 'pricing_terms', allowNull: true })
  pricingTerms: [];

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'taxable_amount',
  })
  taxableAmount: number;

  @Column({ type: DataTypes.DECIMAL(10, 2), defaultValue: 0 })
  cgst: number;

  @Column({ type: DataTypes.DECIMAL(10, 2), defaultValue: 0 })
  sgst: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_amount',
    defaultValue: 0,
  })
  totalAmount: number;

  @Column({ type: DataTypes.JSONB, field: 'invoice_data', allowNull: true })
  invoiceData: [];

  @Column({
    type: DataTypes.DATE,
    field: 'paid_on',
  })
  paidOn: Date;

  @BelongsTo(() => Outlet)
  outlet: Outlet;

  @BelongsTo(() => Machine)
  machine: Machine;

  @BelongsTo(() => User)
  dealer: User;

  @HasOne(() => PaymentTransaction)
  paymentTransaction: PaymentTransaction;
}
