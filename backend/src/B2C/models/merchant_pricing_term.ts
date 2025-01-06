import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { WashType } from '../../models/wash_type';
import { Merchant } from './merchant';

// Table to store pricing terms for merchant
@Table({ tableName: 'merchant_pricing_term' })
export class MerchantPricingTerm extends Model<MerchantPricingTerm> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'merchant_pricing_term_id',
  })
  merchantPricingTermId: string;

  @ForeignKey(() => Merchant)
  @Column({ type: DataType.UUID, field: 'merchant_id', allowNull: true })
  merchantId: string;

  @ForeignKey(() => WashType)
  @Column({ type: DataType.UUID, field: 'wash_type_id', allowNull: true })
  washTypeId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  washPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  manPowerPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  grossAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  cgstPercentage: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  sgstPercentage: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  totalPrice: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  servicesOffered: [];

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @BelongsTo(() => WashType)
  washType: WashType;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;
}
