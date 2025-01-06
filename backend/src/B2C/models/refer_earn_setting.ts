import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Customer } from './customer';
import { Referral } from './reffer';

export enum RewardType {
  AMOUNT = 'Amount',
  WASHES = 'Wash',
}

@Table({ tableName: 'refer_and_earn' })
export class ReferAndEarn extends Model<ReferAndEarn> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
    field: 'refer_and_earn_id',
  })
  referAndEarnId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'refer_and_earn_name',
  })
  referAndEarnName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'refer_and_earn_description',
  })
  referAndEarnDescription: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_date',
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end_date',
  })
  endDate: Date;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'reward_for_referee',
  })
  rewardForReferee: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'reward_for_new_user',
  })
  rewardForNewUser: number;

  @Column({
    type: DataType.ENUM(...Object.values(RewardType)),
    allowNull: false,
    field: 'reward_type_for_referee',
  })
  rewardTypeForReferee: RewardType;

  @Column({
    type: DataType.ENUM(...Object.values(RewardType)),
    allowNull: false,
    field: 'reward_type_for_new_user',
  })
  rewardTypeForNewUser: RewardType;

  // Date when the subscription was deleted (soft delete)
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @HasMany(() => Referral)
  referrals: Referral[];
}
