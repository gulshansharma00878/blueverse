import {
    Model,
    Column,
    Table,
    PrimaryKey,
    DataType,
    HasMany
  } from 'sequelize-typescript';
  import { Slot } from './slot';
  
  @Table({ tableName: 'recurring_event' })
  export class RecurringEvent extends Model<RecurringEvent> {
    @PrimaryKey
    @Column({
      type: DataType.UUID,
      allowNull: false,
      defaultValue: DataType.UUIDV4,
      field: 'event_id',
    })
    eventId: string;
  
    @Column({ type: DataType.STRING, allowNull: false })
    name: string;  // weekly, monthly etc
  
    @Column({ type: DataType.ARRAY(DataType.DATE), allowNull: true })
    excludedDays: Date[];
  
    @HasMany(() => Slot)
    slots: Slot[];
  }
  