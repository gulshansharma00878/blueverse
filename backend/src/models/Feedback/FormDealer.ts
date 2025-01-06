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

@Table({ tableName: 'form_dealers' })
export class FormDealer extends Model<FormDealer> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'form_dealer_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  formDealerId: string;

  @ForeignKey(() => Form)
  @Column({ type: DataTypes.UUID, field: 'form_id' })
  formId: string;

  @BelongsTo(() => Form)
  form: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, field: 'dealer_id' })
  dealerId: string;

  @BelongsTo(() => User)
  dealer: {};
}
