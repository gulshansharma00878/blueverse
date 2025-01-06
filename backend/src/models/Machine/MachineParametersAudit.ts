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

@Table({ tableName: 'machine_parameters_audit' })
export class MachineParametersAudit extends Model<MachineParametersAudit> {
  @Column({
    type: DataTypes.UUID,
    field: 'Guid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Id: string;
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

  @Column({ type: DataTypes.DECIMAL(18, 6) })
  TSSValue: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 6) })
  CODValue: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.DECIMAL(18, 6) })
  OilAndGreaseValue: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.BOOLEAN })
  IsValid: boolean;

  @Column({ type: DataTypes.BOOLEAN, allowNull: true })
  IsDeleted: boolean;

  @Column({ type: DataTypes.STRING })
  AddBy: string;

  @Column({ type: DataTypes.DATE })
  AddDate: DataTypes.DateDataType;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  UpdateBy: string;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  UpdateDate: DataTypes.DateDataType;

  @BelongsTo(() => Machine)
  machine: Machine;
}
