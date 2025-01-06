import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  HasMany,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { Transactions } from '../transactions';
import { Form } from '../Feedback/form';
import { Outlet } from '../outlet';
import { MachineBusinessMode } from './machine_business_mode';
import { OutletMachine } from '../outlet_machine';
import { MachineAgent } from './MachineAgent';
import { MachineWallet } from './MachineWallet';
import { Merchant } from '../../B2C/models/merchant';

@Table({ tableName: 'machine' })
export class Machine extends Model<Machine> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'MachineGuid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  machineGuid: string;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.STRING })
  MindsphereLinker: string;

  @Column({ type: DataTypes.INTEGER })
  Identifier: DataTypes.IntegerDataType;

  @Column({ type: DataTypes.STRING })
  AreaGuid: string;

  @ForeignKey(() => MachineBusinessMode)
  @Column({ type: DataTypes.UUID })
  MachineBusinessModeGuid: string;

  @Column({ type: DataTypes.STRING })
  ShortName: string;

  @Column({ type: DataTypes.STRING })
  MachineTag: string;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  FoamPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  ShampooPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  WaxPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  ElectricityPerUnitPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  WaterPerLiterPrice: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.STRING, allowNull: true })
  Latitude: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  Longitude: string;

  @Column({ type: DataTypes.STRING })
  PlcTag: string;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  PhLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  PhUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  OilAndGreesLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  OilAndGreesUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TssLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TssUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  CodLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  CodUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.BOOLEAN })
  IsValid: boolean;

  @Column({ type: DataTypes.BOOLEAN, allowNull: true })
  IsDeleted: boolean;

  @Column({ type: DataTypes.STRING })
  AddBy: string;

  @Column({ type: DataTypes.DATE })
  AddDate: DataTypes.DateDataType;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  UpdateBy: string;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  UpdateDate: DataTypes.DateDataType;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  MindsphereDataParameter: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  MindsphereRunTimeParameter: string;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TDSLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TDSUpperLimit: DataTypes.DecimalDataType;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  IotAssetId: string;

  @ForeignKey(() => Form)
  @Column({ type: DataTypes.UUID, field: 'form_id', allowNull: true })
  feedbackFormId: string;

  @BelongsTo(() => Form)
  feedbackForm: string;

  @ForeignKey(() => Outlet)
  @Column({ type: DataTypes.UUID, field: 'outlet_id', allowNull: true })
  outletId: string;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_assigned',
    defaultValue: false,
  })
  isAssigned: boolean;

  @Column({
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
    defaultValue: 'ACTIVE',
  })
  status: string;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'wallet_balance',
    defaultValue: 0,
  })
  walletBalance: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'blueverse_credit',
    defaultValue: 0,
  })
  blueverseCredit: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'top_up_balance',
    defaultValue: 0,
  })
  topUpBalance: number;

  @BelongsTo(() => Outlet)
  outlet: Outlet;

  @HasMany(() => Transactions)
  transactions: Transactions[];

  @HasMany(() => MachineAgent)
  agents: MachineAgent[];

  @BelongsTo(() => MachineBusinessMode)
  MachineBusinessMode: MachineBusinessMode;

  @HasOne(() => OutletMachine)
  machineSubscriptionSetting: OutletMachine;

  @HasMany(() => MachineWallet)
  machineWallet: [MachineWallet];

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @ForeignKey(() => Merchant) //Key for Merchant id
  @Column({ type: DataTypes.UUID, allowNull: true, field: 'merchant_id' })
  merchantId: string;

}
