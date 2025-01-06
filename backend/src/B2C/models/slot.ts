import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Booking } from './booking';
import { RecurringEvent } from './recurring_event';
import { Merchant } from './merchant';

@Table({ tableName: 'slot' })
export class Slot extends Model<Slot> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    field: 'slot_id',
  })
  slotId: string;

  @Column({ type: DataType.DATE, allowNull: false, field: 'start_date_time' })
  startDateTime: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'end_date_time' })
  endDateTime: Date;

  // @Column({
  //   type: DataType.INTEGER,
  //   allowNull: false,
  //   field: 'interval_minutes',
  // })
  // intervalMinutes: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  active: boolean;

  @Column({ type: DataType.TIME, allowNull: true })
  inactiveStartTime: string;

  @Column({ type: DataType.TIME, allowNull: true })
  inactiveEndTime: string;

  @HasMany(() => Booking)
  bookings: Booking[];

  @ForeignKey(() => RecurringEvent)
  @Column({ type: DataType.UUID, allowNull: true, field: 'recurring_event_id' })
  recurringEventId: string;

  @BelongsTo(() => RecurringEvent)
  recurringEvent: RecurringEvent;

  @ForeignKey(() => Merchant)
  @Column({ type: DataType.UUID, allowNull: false, field: 'merchant_id' })
  merchantId: string;
}
