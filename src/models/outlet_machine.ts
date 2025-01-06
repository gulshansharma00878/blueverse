import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
} from 'sequelize-typescript';
import { STATUS } from '../module/areaModule/constant';
import { Outlet } from './outlet';
import { Machine } from './Machine/Machine';

@Table({ tableName: 'outlet_machine' })
export class OutletMachine extends Model<OutletMachine> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'outlet_machine_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  outletMachineId: string;

  @ForeignKey(() => Outlet)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'outlet_id' })
  outletId: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'machine_id' })
  machineId: string;

  @Column({ type: DataTypes.INTEGER, defaultValue: STATUS.ACTIVE })
  status: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'security_deposited',
  })
  securityDeposited: number;

  @Column({ type: DataTypes.INTEGER, defaultValue: 0, field: 'billing_cycle' })
  billingCycle: number;

  @Column({ type: DataTypes.INTEGER, defaultValue: 0, field: 'invoice_date' })
  invoiceDate: number;

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

  @Column({ type: DataTypes.DECIMAL(10, 2), defaultValue: 0 })
  total: number;
}
