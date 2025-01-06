import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from './customer';

@Table({ tableName: 'customer_device_token' })
export class CustomerDeviceToken extends Model<CustomerDeviceToken> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'customer_device_token_id',
  })
  customerDeviceTokenId: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'customer_id' })
  customerId: string;

  @BelongsTo(() => Customer)
  customer: Customer;

  @Column({ allowNull: false, type: DataTypes.TEXT, field: 'device_token' })
  deviceToken: string;
}
