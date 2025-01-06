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
import { WalletTransaction } from './wallet_transection';

@Table({ tableName: 'user_wallet' })
export class UserWallet extends Model<UserWallet> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    field: 'wallet_id',
  })
  walletId: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'customer_id' })
  customerId: string;

  @BelongsTo(() => Customer)
  user: Customer;

  @Column({ type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 })
  balance: number;

  @Column({ type: DataTypes.STRING, allowNull: false, defaultValue: 'INR' })
  currency: string;

  @HasMany(() => WalletTransaction)
  transactions: WalletTransaction[];
}
