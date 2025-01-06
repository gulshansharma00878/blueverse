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

@Table({ tableName: 'machines_parameter_upper_lower_audit' })
export class MachinesParameterUpperLowerAudit extends Model<MachinesParameterUpperLowerAudit> {
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

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  PhLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  PhUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TDSLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TDSUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TssLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  TssUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  CodLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  CodUpperLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  OilAndGreesLowerLimit: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  OilAndGreesUpperLimit: DataTypes.DecimalDataType;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  UpdateDate: DataTypes.DateDataType;

  @BelongsTo(() => Machine)
  machine: Machine;
}
