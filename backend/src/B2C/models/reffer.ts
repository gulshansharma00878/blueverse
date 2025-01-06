import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { Customer } from './customer';
import { ReferAndEarn } from './refer_earn_setting';

export enum RewardType {
  AMOUNT = 'Amount',
  WASHES = 'Wash',
}

@Table({ tableName: 'referrals' })
export class Referral extends Model<Referral> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, allowNull: false, field: 'referral_id' })
  referralId: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataType.UUID, allowNull: false, field: 'referrer_user_id' })
  referrerUserId: string;

  @BelongsTo(() => Customer, 'referrerUserId')
  referrer: Customer;

  @ForeignKey(() => Customer)
  @Column({ type: DataType.UUID, allowNull: false, field: 'referred_user_id' })
  referredUserId: string;

  @BelongsTo(() => Customer, 'referredUserId')
  referred: Customer;

  @Column({
    type: DataType.ENUM('Pending', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending',
    field: 'referral_status'
  })
  referralStatus: 'Pending' | 'Completed';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: 'true',
    field: 'is_download'
  })
  isDownload: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: 'false',
    field: 'is_booked'
  })
  isBooked: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(RewardType)),
    allowNull: true,
    field: 'referrer_bonus_type'
  })
  referrerBonusType: RewardType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'referrer_bonus'
  })
  referrerBonus: number;

  @Column({
    type: DataType.ENUM(...Object.values(RewardType)),
    allowNull: true,
    field: 'referred_user_bonus_type'
  })
  referredUserBonusType: RewardType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'referred_user_bonus'
  })
  referredUserBonus: number;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'expiry_date',
  })
  expiryDate: Date;

  @Column({
    type: DataType.ENUM('Active', 'Inactive','Expired'),
    allowNull: false,
    defaultValue: 'Active',
  })
  status: 'Active' | 'Inactive' | 'Expired';

  @ForeignKey(() => ReferAndEarn) // Define the foreign key for the Refer And Earn association
  @Column({ type: DataType.UUID, allowNull: true, field: 'refer_and_earn_id' })
  referAndEarnId: string;

  @BelongsTo(() => ReferAndEarn)
  referAndEarn: ReferAndEarn;
}
