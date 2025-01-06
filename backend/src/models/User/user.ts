import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  HasMany,
  BelongsTo,
  ForeignKey,
  Index,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Outlet } from '../outlet';
import { OEM } from '../oem';
import { DealerDocument } from './Dealer/dealer_document';
import { SubRole } from './SubRole';
import { UserArea } from './UserArea';
import { AreaManagerOEM } from './AreaManagerOEM';
import { AreaManagerDealers } from './AreaManagerDealers';
import { OEMManagerDealers } from './OEMManagerDealers';
import { UserDevice } from './UserDevice';
import { Merchant } from '../../B2C/models/merchant';

@Table({ tableName: 'user' })
export class User extends Model<User> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'user_id' })
  userId: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
    unique: true,
    field: 'unique_id',
  })
  uniqueId: string;

  @Column({ allowNull: false, type: DataTypes.STRING })
  username: string;

  @Column({ allowNull: true, field: 'first_name', type: DataTypes.STRING })
  firstName: string;

  @Column({ allowNull: true, field: 'last_name', type: DataTypes.STRING })
  lastName: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  email: string;

  @Column({ allowNull: false, type: DataTypes.STRING })
  password: string;

  @Column({ type: DataTypes.TEXT })
  phone: DataTypes.TextDataType;

  @Column({ field: 'country_code' })
  countryCode: string;

  @Column({ type: DataTypes.STRING })
  address: string;

  @Column({ type: DataTypes.BOOLEAN, field: 'is_active', defaultValue: false })
  isActive: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
    field: 'old_password_one',
  })
  oldPasswordOne: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
    field: 'old_password_two',
  })
  oldPasswordTwo: string;

  @Column({
    type: DataTypes.ENUM(
      'ADMIN',
      'FEEDBACK_AGENT',
      'SUB_ADMIN',
      'AREA_MANAGER',
      'OEM',
      'DEALER',
      'EMPLOYEE'
    ),
    defaultValue: 'ADMIN',
  })
  role: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
    field: 'deleted_by',
  })
  deletedBy: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
    field: 'pan_no',
  })
  panNo: string;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_kyc_done',
    defaultValue: false,
  })
  isKycDone: boolean;

  @Column({
    type: DataTypes.STRING(500),
    field: 'profile_img',
    allowNull: true,
  })
  profileImg: string;

  @ForeignKey(() => OEM)
  @Column({
    type: DataTypes.UUID,
    field: 'oem_id',
    allowNull: true,
  })
  oemId: string;

  @ForeignKey(() => SubRole)
  @Column({
    type: DataTypes.UUID,
    field: 'sub_role_id',
    allowNull: true,
  })
  subRoleId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'parent_user_id',
    allowNull: true,
  })
  parentUserId: string;

  @Column({
    type: DataTypes.DATE,
    field: 'kyc_done_at',
    allowNull: true,
  })
  kycDoneAt: Date;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_assigned',
    defaultValue: false,
  })
  isAssigned: boolean;
  // column used for Area manager and OEM manager
  @Column({ type: DataTypes.TEXT, allowNull: true })
  description: DataTypes.TextDataType;

  // Dealer has multiple outlets
  @HasMany(() => Outlet)
  outlets: Outlet[];

  @BelongsTo(() => OEM)
  oem: OEM;

  @HasMany(() => DealerDocument)
  documents: DealerDocument[];

  @BelongsTo(() => SubRole)
  subRole: SubRole;

  @BelongsTo(() => User)
  parentUser: User;

  @HasMany(() => UserArea)
  userArea: UserArea;

  @HasMany(() => AreaManagerOEM)
  areaManagersOEM: AreaManagerOEM;

  @HasMany(() => OEMManagerDealers)
  oemManagerDealers: OEMManagerDealers;

  @HasMany(() => AreaManagerDealers)
  areaManagerDealers: AreaManagerDealers;

  @HasMany(() => UserDevice)
  loggedInDevice: UserDevice;
}
