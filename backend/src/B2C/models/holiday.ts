import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
} from 'sequelize-typescript';

@Table({ tableName: 'holiday' })
export class Holiday extends Model<Holiday> {
  // Primary key using UUID, with default value generated as UUIDV4
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'holiday_id',
  })
  holidayId: string;

  @Column({
    type: DataType.STRING,
    field: 'holiday_name',
    allowNull: false,
  })
  holidayName: string; // Changed type to number

  // Name of the coupon
  @Column({
    type: DataType.DATEONLY,
    field: 'holiday_date',
    allowNull: false,
  })
  holidayDate: string;

  // Date when the coupon was deleted (soft delete)
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;
}
