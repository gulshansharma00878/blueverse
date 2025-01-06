import { DataTypes } from 'sequelize';
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'machine_business_mode' })
export class MachineBusinessMode extends Model<MachineBusinessMode> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'Guid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Guid: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  Name: string;

  @Column({ type: DataTypes.BOOLEAN, allowNull: false })
  IsValid: string;

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
}
