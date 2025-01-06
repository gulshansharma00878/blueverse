import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  HasOne,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Machine } from './Machine/Machine';
import { WashType } from './wash_type';
import { TransactionsFeedback } from './Feedback/TransactionsFeedback';
import { MachineWallet } from './Machine/MachineWallet';
import { Customer } from '../B2C/models/customer';
@Table({ tableName: 'transactions' })
export class Transactions extends Model<Transactions> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'Guid' })
  Guid: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID, field: 'MachineGuid' })
  MachineGuid: string;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  PHValue: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  TDSValue: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  ElectricityUsed: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  ElectricityPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  FoamUsed: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  FoamPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  ShampooUsed: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  ShampooPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  WaxUsed: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  WaxPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  WaterUsed: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  WaterWastage: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  WaterPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  CODValue: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  TSSValue: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  OilAndGreaseValue: DataTypes.DecimalDataType;

  @ForeignKey(() => WashType)
  @Column({ type: DataTypes.UUID, field: 'WashTypeGuid' })
  WashTypeGuid: string;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  WashTypePrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.INTEGER, field: 'WashTime' })
  WashTime: number;

  @Column({ type: DataTypes.STRING, field: 'BusinessModeGuid' })
  BusinessModeGuid: string;

  @Column({ type: DataTypes.BOOLEAN, field: 'IsWashCompleted' })
  IsWashCompleted: boolean;

  @Column({ type: DataTypes.DATE, field: 'AddDate' })
  AddDate: DataTypes.DateDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  ElectricityTotalUsage: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  Volt_R_N_IOT: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  Volt_Y_N_IOT: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 2) })
  Volt_B_N_IOT: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.INTEGER, field: 'WashCounter' })
  WashCounter: number;

  @Column({ type: DataTypes.INTEGER, field: 'SerialNo' })
  SerialNo: number;

  @Column({ type: DataTypes.STRING, field: 'SkuNumber' })
  SkuNumber: string;

  @Column({ type: DataTypes.STRING, field: 'SkuDigit' })
  SkuDigit: string;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'QRGenerated',
    defaultValue: false,
  })
  QRGenerated: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  IsAssigned: boolean;

  @BelongsTo(() => Machine)
  machine: Machine;

  @BelongsTo(() => WashType)
  washType: WashType;

  @HasOne(() => TransactionsFeedback)
  transactionFeedback: [];

  @HasOne(() => MachineWallet)
  machineWallet: MachineWallet;

  @ForeignKey(() => Customer)
  @Column({ type: DataTypes.UUID, allowNull: true, field: 'customerId' })
  customerId: string;

  @BelongsTo(() => Customer)
  customer: Customer;
}
