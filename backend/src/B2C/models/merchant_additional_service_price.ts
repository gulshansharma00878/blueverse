import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Merchant } from './merchant';
import { AdditionalService } from './additional_service';

// Table to store pricing terms for merchant
@Table({ tableName: 'merchant_additional_service_price' })
export class MerchantAdditionalServicePrice extends Model<MerchantAdditionalServicePrice> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'merchant_additional_service_price_id',
  })
  merchantAdditionalServicePriceId: string;

  @ForeignKey(() => Merchant)
  @Column({ type: DataType.UUID, field: 'merchant_id', allowNull: true })
  merchantId: string;

  @ForeignKey(() => AdditionalService)
  @Column({
    type: DataType.UUID,
    field: 'additional_service_id',
    allowNull: true,
  })
  additionalServiceId: string;

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
  price: number;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @BelongsTo(() => AdditionalService)
  additionalService: AdditionalService;
}
