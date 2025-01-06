import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { Customer } from './customer';

export enum VehicleType {
  ALL = 'ALL',
  TWO_WHEELER = 'TWO_WHEELER',
  FOUR_WHEELER = 'FOUR_WHEELER',
}

@Table({ tableName: 'vehicle' })
export class Vehicle extends Model<Vehicle> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, allowNull: false, field: 'vehicle_id' })
  vehicleId: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataType.UUID, allowNull: false, field: 'customer_id' })
  customerId: string;

  @BelongsTo(() => Customer)
  customer: Customer;

  @Column({ type: DataType.STRING, field: 'hsrp_number', allowNull: false })
  hsrpNumber: string;

  @Column({ type: DataType.STRING, allowNull: true })
  manufacturer: string;

  @Column({ type: DataType.STRING, field: 'vehicle_model', allowNull: true })
  vehicleModel: string;

  @Column({ type: DataType.STRING, allowNull: true, field: 'image_url' })
  imageUrl: string;

  @Column({ type: DataType.STRING, allowNull: true, field: 'vehicle_type' })
  vehicleType: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @Column({
    allowNull: true,
    type: DataType.BOOLEAN,
    field: 'is_deleted',
    defaultValue: false,
  })
  isDeleted: boolean;
}
