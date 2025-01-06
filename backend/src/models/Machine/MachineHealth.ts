import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { HealthMatrix } from '../HealthMatrix';
import { Machine } from './Machine';

@Table({ tableName: 'machine_health' })
export class MachineHealth extends Model<MachineHealth> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'Guid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Guid: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID })
  MachineGuid: string;

  @ForeignKey(() => HealthMatrix)
  @Column({ type: DataTypes.UUID })
  AlarmGuid: string;

  @Column({ type: DataTypes.BOOLEAN })
  Status: boolean;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  UpdateDate: DataTypes.DateDataType;

  @BelongsTo(() => Machine)
  Machine: Machine;

  @BelongsTo(() => HealthMatrix)
  HealthMatrix: HealthMatrix;
}
