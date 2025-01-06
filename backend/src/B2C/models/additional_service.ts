import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

// Table to store additional service name for mechant
@Table({ tableName: 'additional_service' })
export class AdditionalService extends Model<AdditionalService> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    field: 'additional_service_id',
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  additionalServiceId: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_two_wheeler',
    defaultValue: false,
  })
  isTwoWheeler: boolean;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_four_wheeler',
    defaultValue: false,
  })
  isFourWheeler: boolean;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;
}
