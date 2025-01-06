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

@Table({ tableName: 'machine_status_history' })
export class MachineStatusHistory extends Model<MachineStatusHistory> {
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

  @Column({ type: DataTypes.BOOLEAN })
  Status: boolean;

  @Column({ type: DataTypes.DATE })
  AddDate: DataTypes.DateDataType;

  @BelongsTo(() => Machine)
  Machine: Machine;
}
