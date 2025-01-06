import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Machine } from './Machine/Machine';

@Table({ tableName: 'service_request' })
export class ServiceRequest extends Model<ServiceRequest> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'service_request_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  serviceRequestId: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'machine_id' })
  machineId: string;

  @Column({ type: DataTypes.STRING })
  serviceId: string;

  @Column({ type: DataTypes.BOOLEAN, defaultValue: false })
  isResolved: boolean;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  description: string;

  @BelongsTo(() => Machine)
  machine: Machine;
}
