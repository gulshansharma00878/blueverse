import { DataTypes } from 'sequelize';
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'health_matrix' })
export class HealthMatrix extends Model<HealthMatrix> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'Guid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Guid: string;

  @Column({ type: DataTypes.STRING })
  Alarm: string;

  @Column({ type: DataTypes.DECIMAL(18, 6) })
  Weightage: DataTypes.DecimalDataType;

  @Column({ type: DataTypes.BOOLEAN })
  Critical: boolean;

  @Column({ type: DataTypes.BOOLEAN })
  Escalate: boolean;

  @Column({ type: DataTypes.BOOLEAN })
  IsValid: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
  })
  isDeleted: boolean;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  AddBy: string;

  @Column({
    type: DataTypes.DATE,
    allowNull: false,
  })
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

  @Column({ type: DataTypes.STRING, allowNull: false })
  PlcTag: string;
}
