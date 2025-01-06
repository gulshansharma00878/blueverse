import { DataTypes, Op } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
} from 'sequelize-typescript';
import { Machine } from './Machine';
import { Transactions } from '../transactions';
import { User } from '../User/user';
import { isNullOrUndefined } from '../../common/utility';

@Table({ tableName: 'machine_wallet' })
export class MachineWallet extends Model<MachineWallet> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'machine_wallet_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  machineWalletId: string;

  @Column({
    type: DataTypes.TEXT,
    field: 'description',
  })
  description: string;

  @ForeignKey(() => Machine)
  @Column({
    type: DataTypes.UUID,
    field: 'machine_id',
  })
  machineId: string;

  @ForeignKey(() => Transactions)
  @Column({
    type: DataTypes.UUID,
    field: 'transaction_id',
  })
  transactionId: string;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'man_power_price_per_wash',
    defaultValue: 0,
  })
  manpowerPricePerWash: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'dealer_per_wash_price',
    defaultValue: 0,
  })
  dealerPerWashPrice: number;

  @Column({
    type: DataTypes.STRING,
    field: 'wash_type',
  })
  washType: string;

  @Column({
    type: DataTypes.ENUM('WALLET', 'CREDIT', 'TOPUP'),
    field: 'source_type',
    defaultValue: 'WALLET',
  })
  sourceType: string;

  @Column({
    type: DataTypes.ENUM('ADDED', 'DEBITED'),
    field: 'transaction_type',
  })
  transactionType: string;

  @Column({
    type: DataTypes.STRING,
    field: 'sku_number',
  })
  skuNumber: string;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'cgst',
  })
  cgst: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'gst',
  })
  sgst: number;

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

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'base_amount',
  })
  baseAmount: number;

  @Column({
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_amount',
  })
  totalAmount: number;

  @Column({
    type: DataTypes.STRING,
    field: 'unique_id',
  })
  uniqueId: string;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
    field: 'real_created_at',
  })
  realCreatedAt: Date; //new coloumn to store entry create time

  @BelongsTo(() => Machine)
  machine: {};

  @BelongsTo(() => Transactions)
  transactions: {};

  @BeforeCreate
  static async addUniqueId(instance: MachineWallet) {
    instance.uniqueId = await getMachineWalletUniqueId();
    instance.realCreatedAt = new Date();
  }
}

const getMachineWalletUniqueId = async () => {
  const lastWallet = await MachineWallet.findOne({
    where: {
      realCreatedAt: { [Op.ne]: null }, // Exclude null values
    },
    order: [['realCreatedAt', 'DESC']],
    attributes: ['machineWalletId', 'uniqueId', 'realCreatedAt'],
  });

  const format = 'BV-';
  let newSerialNo = '00001';
  if (lastWallet && !!lastWallet.uniqueId) {
    const number = lastWallet.uniqueId.split('-');
    const newNumber = Number(number.at(-1)) + 1;
    if (newNumber.toString().length < 5) {
      newSerialNo = ('0000' + newNumber).slice(-5);
    } else {
      newSerialNo = newNumber.toString();
    }
  }
  return format + newSerialNo;
};
