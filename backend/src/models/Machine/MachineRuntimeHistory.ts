import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Machine } from './Machine';

@Table({ tableName: 'machine_runtime_history' })
export class MachineRuntimeHistory extends Model<MachineRuntimeHistory> {
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

  @Column({ type: DataTypes.INTEGER })
  MachineRunTime: number;

  @Column({ type: DataTypes.DATE })
  RunTimeDate: DataTypes.DateDataType;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  UpdateDate: DataTypes.DateDataType;

  @BelongsTo(() => Machine)
  machine: Machine;
}
