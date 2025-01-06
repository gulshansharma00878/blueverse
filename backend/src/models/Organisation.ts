import { DataTypes } from 'sequelize';
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'organisation' })
export class Organisation extends Model<Organisation> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'organisation_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Guid: string;

  @Column({ type: DataTypes.STRING, field: 'name' })
  Name: string;

  @Column({ type: DataTypes.STRING, field: 'short_name' })
  ShortName: string;

  @Column({ type: DataTypes.STRING, field: 'address' })
  Address: string;

  @Column({ type: DataTypes.INTEGER, field: 'pincode' })
  Pincode: number;

  @Column({ type: DataTypes.BOOLEAN, field: 'is_valid' })
  IsValid: boolean;

  @Column({ type: DataTypes.BOOLEAN, field: 'is_deleted' })
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
}
