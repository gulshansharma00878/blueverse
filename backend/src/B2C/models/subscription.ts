import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Customer } from './customer';
import { VehicleType } from '../models/vehicle';

@Table({ tableName: 'subscription' })
export class Subscription extends Model<Subscription> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    field: 'subscription_id',
  })
  subscriptionId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'subscription_name',
  })
  subscriptionName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'subscription_description',
  })
  subscriptionDescription: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'price',
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'silver_wash_offered',
    defaultValue: 0,
  })
  silverWashOffered: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'gold_wash_offered',
    defaultValue: 0,
  })
  goldWashOffered: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'platinum_wash_offered',
    defaultValue: 0,
  })
  platinumWashOffered: number;

  @Column({
    type: DataType.STRING, 
    allowNull: true, 
    field: 'silver_service_offered'
  })
  silverServiceOffered: string;

  @Column({
    type: DataType.STRING, 
    allowNull: true, 
    field: 'gold_service_offered'
  })
  goldServiceOffered: string;

  @Column({
    type: DataType.STRING, 
    allowNull: true, 
    field: 'platinum_service_offered'
  })
  platinumServiceOffered: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'subscription_days',
    defaultValue: 0,
  })
  subscriptionDays: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'subscription_created_on',
  })
  subscriptionCreatedOn: Date;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  })
  isActive: boolean;

  // Date when the subscription was deleted (soft delete)
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

   // Vehicle type for the notification
   @Column({
    type: DataType.ENUM(...Object.values(VehicleType)),
    // allowNull: false,
    field: 'vehicle_type',
  })
  vehicleType: VehicleType;

  @HasMany(() => Customer)
  customers: Customer[];
}
