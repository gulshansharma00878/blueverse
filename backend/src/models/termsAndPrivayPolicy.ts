import { DataTypes } from 'sequelize';
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'terms_and_privacy_policy' })
export class TermsAndPrivacyPolicy extends Model<TermsAndPrivacyPolicy> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'policy_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  policyId: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'privacy_policy',
  })
  privacyPolicy: DataTypes.TextDataType;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'terms_of_user',
  })
  termsOfUse: DataTypes.TextDataType;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_active',
  })
  isActive: Boolean;

  @Column({
    type: DataTypes.ENUM('DEALER', 'CUSTOMER', 'ADMIN'),
    defaultValue: 'DEALER',
  })
  type: string;
}
