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
import { Holiday } from './holiday';

// Table to store pricing terms for merchant
@Table({ tableName: 'merchant_holiday' })
export class MerchantHoliday extends Model<MerchantHoliday> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'merchant_holiday_id',
  })
  merchantHolidayId: string;

  @ForeignKey(() => Merchant)
  @Column({ type: DataType.UUID, field: 'merchant_id', allowNull: false })
  merchantId: string;

  @ForeignKey(() => Holiday)
  @Column({
    type: DataType.UUID,
    field: 'holiday_id',
    allowNull: false,
  })
  holidayId: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @BelongsTo(() => Holiday)
  holiday: Holiday;
}
