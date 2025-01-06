import { DataTypes } from 'sequelize';
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'escalation_contacts' })
export class EscalationContacts extends Model<EscalationContacts> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'Guid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Guid: string;

  @Column({ type: DataTypes.STRING })
  Name: string;

  @Column({ type: DataTypes.STRING })
  DesignationGuid: string;

  @Column({ type: DataTypes.STRING })
  MobileNumber: string;

  @Column({ type: DataTypes.STRING })
  Email: string;

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
}
