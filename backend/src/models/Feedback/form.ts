import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  HasMany,
  BelongsTo,
  ForeignKey,
  HasOne,
} from 'sequelize-typescript';
import { City } from '../city';
import { Machine } from '../Machine/Machine';
import { Question } from './question';
import { Region } from '../region';
import { State } from '../state';
import { OEM } from '../oem';
import { FormDealer } from './FormDealer';
import { TransactionsFeedback } from './TransactionsFeedback';
import { Merchant } from '../../B2C/models/merchant';
import { FormMerchant } from './FormMerchant';

@Table({ tableName: 'form' })
export class Form extends Model<Form> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'form_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  formId: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  name: string;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  description: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_deleted',
  })
  isDeleted: boolean;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    field: 'deleted_at',
  })
  DeletedAt: Date;

  @Column({ type: DataTypes.UUID, allowNull: false, field: 'created_by' })
  createdBy: string;

  @Column({
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
    field: 'deleted_by',
  })
  deletedBy: string;

  @HasMany(() => Question)
  questions: Question[];

  @ForeignKey(() => City)
  @Column({ type: DataTypes.UUID, field: 'city_id' })
  cityId: string;

  @BelongsTo(() => City)
  city: City;

  @ForeignKey(() => Region)
  @Column({ type: DataTypes.UUID, field: 'region_id' })
  regionId: string;

  @BelongsTo(() => Region)
  region: string;

  @ForeignKey(() => State)
  @Column({ type: DataTypes.UUID, field: 'state_id' })
  stateId: string;

  @BelongsTo(() => State)
  state: string;

  @HasMany(() => Machine)
  machine: [];

  @ForeignKey(() => OEM)
  @Column({ type: DataTypes.UUID, field: 'oem_id',allowNull: true, })
  oemId: string;

  @BelongsTo(() => OEM)
  oem: string;

  @HasMany(() => FormDealer)
  dealers: [];

  @HasMany(() => TransactionsFeedback)
  transactionFeedbacks: TransactionsFeedback[];

  @HasMany(() => FormMerchant)
  merchants: [];
}
