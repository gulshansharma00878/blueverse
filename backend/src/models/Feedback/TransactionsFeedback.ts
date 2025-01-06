import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Form } from './form';
import { FeedbackResponse } from './feedback_response';
import { Transactions } from '../transactions';
import { User } from '../User/user';

@Table({ tableName: 'transactions_feedback' })
export class TransactionsFeedback extends Model<TransactionsFeedback> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'transaction_feedback_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  transactionFeedbackId: string;

  @ForeignKey(() => Transactions)
  @Column({
    type: DataTypes.UUID,
    field: 'transaction_guid',
  })
  transactionGuid: string;

  @BelongsTo(() => Transactions)
  transactions: Transactions;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  phone: string;

  @Column({
    type: DataTypes.STRING,
    field: 'email_id',
    allowNull: true,
  })
  emailId: string;

  @Column({
    type: DataTypes.STRING,
    field: 'hsrp_number',
  })
  hsrpNumber: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  manufacturer: string;

  @Column({
    type: DataTypes.STRING,
    field: 'bike_model',
    allowNull: true,
  })
  bikeModel: string;

  @Column({
    type: DataTypes.STRING,
    field: 'sku_number',
  })
  skuNumber: string;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_completed',
    defaultValue: false,
  })
  isCompleted: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_profile_completed',
    defaultValue: false,
  })
  isProfileCompleted: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
    field: 'completed_at',
  })
  completedAt: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
    field: 'wash_time',
  })
  washTime: DataTypes.DateDataType;

  @ForeignKey(() => Form)
  @Column({
    type: DataTypes.UUID,
    field: 'form_id',
    allowNull: false,
  })
  formId: string;

  @BelongsTo(() => Form)
  form: Form;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
    field: 'certificate',
  })
  certificate: string;

  @Column({ field: 'transaction_type', type: DataTypes.STRING })
  transactionType: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
    field: 'notified_at',
  })
  notifiedAt: Date;

  @ForeignKey(() => User)
  @Column({ field: 'created_by', type: DataTypes.UUID })
  createdBy: string;

  @BelongsTo(() => User)
  agent: User;

  @HasMany(() => FeedbackResponse)
  formResponse: [];

  @Column({ type: DataTypes.STRING, allowNull: true, field: 'vehicle_type' })
  vehicleType: string;
}
