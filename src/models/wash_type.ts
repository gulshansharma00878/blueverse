import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import { Transactions } from './transactions';

@Table({ tableName: 'wash_types' })
export class WashType extends Model<WashType> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'Guid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Guid: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  OrganisationGuid: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  Name: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  InternalName: string;

  @Column({ type: DataTypes.TEXT, allowNull: false })
  Description: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  PlcTag: string;

  @Column({ type: DataTypes.BOOLEAN, allowNull: false })
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

  @Column({ type: DataTypes.INTEGER })
  ExpectedWashTime: DataTypes.IntegerDataType;

  @Column({ type: DataTypes.INTEGER })
  OrderNo: DataTypes.IntegerDataType;

  @Column({ type: DataTypes.STRING })
  Prefix: string;

  @HasMany(() => Transactions)
  transactions: Transactions[];
}
