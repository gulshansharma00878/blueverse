import { DataTypes } from 'sequelize';
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript';
import { Json } from 'sequelize/types/utils';

@Table({ tableName: 'machine_status_log' })
export class MachineStatusLog extends Model<MachineStatusLog> {
  @PrimaryKey
  @Column({
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  message: DataTypes.TextDataType;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  message_template: DataTypes.TextDataType;

  @Column({ type: DataTypes.INTEGER, allowNull: true })
  level: number;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  timestamp: DataTypes.DateDataType;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  exception: DataTypes.TextDataType;

  @Column({ type: DataTypes.JSONB, allowNull: true })
  log_event: [];
}
