import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Customer } from './customer';
import { WashWalletTransaction } from './wash_wallet_transaction';

@Table({ tableName: 'user_wash_wallet' })
export class UserWashWallet extends Model<UserWashWallet> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    field: 'wash_wallet_id',
  })
  washWalletId: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'customer_id' })
  customerId: string;

  @BelongsTo(() => Customer)
  user: Customer;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  freeWash: number;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  silverWash: number;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  goldWash: number;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  platinumWash: number;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  silverWashFourWheeler: number;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  goldWashFourWheeler: number;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  platinumWashFourWheeler: number;

  @HasMany(() => WashWalletTransaction)
  washTransactions: WashWalletTransaction[];
}
