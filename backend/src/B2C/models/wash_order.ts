import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Merchant } from './merchant';
import { Vehicle } from './vehicle';
import { WashType } from '../../models/wash_type';
import { Slot } from './slot';
import { Booking } from './booking';

@Table({ tableName: 'wash_order' })
export class WashOrder extends Model<WashOrder> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    field: 'wash_order_id',
  })
  washOrderId: string;

  @ForeignKey(() => Merchant)
  @Column({ type: DataType.UUID, allowNull: false, field: 'merchant_id' })
  merchantId: string;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @ForeignKey(() => WashType)
  @Column({ type: DataType.UUID, allowNull: false, field: 'wash_type_id' })
  washTypeId: string;

  @BelongsTo(() => WashType)
  washType: WashType;

  @ForeignKey(() => Slot)
  @Column({ type: DataType.UUID, allowNull: false, field: 'slot_id' })
  slotId: string;

  @BelongsTo(() => Slot)
  slot: Slot;

  @ForeignKey(() => Vehicle)
  @Column({ type: DataType.UUID, allowNull: false, field: 'vehicle_id' })
  vehicleId: string;

  @BelongsTo(() => Vehicle)
  vehicle: Vehicle;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'water_saved',
  })
  waterSaved: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'wash_points',
  })
  washPoints: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'rating',
  })
  rating: number;

  @Column({ type: DataType.STRING, allowNull: false })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'remarks' })
  remarks: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'customer_id' })
  customerId: string;

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
  cgstPercentage: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  sgstPercentage: number;
}
