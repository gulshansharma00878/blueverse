import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Form } from './form';
import { User } from '../User/user';
import { Merchant } from '../../B2C/models/merchant';

@Table({ tableName: 'form_merchants' })
export class FormMerchant extends Model<FormMerchant> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'form_merchant_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  formMerchantId: string;

  @ForeignKey(() => Form)
  @Column({ type: DataTypes.UUID, field: 'form_id' })
  formId: string;

  @BelongsTo(() => Form)
  form: string;

  @ForeignKey(() => Merchant)
  @Column({ type: DataTypes.UUID, field: 'merchant_id' })
  merchantId: string;

  @BelongsTo(() => Merchant)
  merchant: {};
}
