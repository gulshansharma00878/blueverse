import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  ForeignKey,
} from 'sequelize-typescript';
import { Merchant } from './merchant';
import { AdditionalService } from './additional_service';

// Table to store pricing terms for merchant
@Table({ tableName: 'booking_additional_service' })
export class BookingAdditionalService extends Model<BookingAdditionalService> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'booking_additional_service_id',
  })
  bookingAdditionalServiceId: string;

  @ForeignKey(() => Merchant)
  @Column({ type: DataType.UUID, field: 'merchant_id', allowNull: true })
  merchantId: string;

  @ForeignKey(() => AdditionalService)
  @Column({
    type: DataType.UUID,
    field: 'additional_service_id',
    allowNull: false,
  })
  additionalServiceId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  price: number;

  @Column({
    type: DataType.UUID,
    field: 'booking_id',
    allowNull: false,
  })
  bookingId: string;

  @Column({
    type: DataType.STRING,
    field: 'additional_service_name',
    allowNull: false,
  })
  additionalServiceName: string;
}
