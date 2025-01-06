import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  HasMany,
  BelongsTo,
  HasOne,
  ForeignKey,
} from 'sequelize-typescript';
import { SubRoleModulePermission } from './SubRoleModulePermission';
import { User } from './user';

@Table({ tableName: 'sub_role' })
export class SubRole extends Model<SubRole> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'sub_role_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  subRoleId: string;

  @Column({
    type: DataTypes.STRING(300),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
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
  deletedAt: Date;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_admin_role',
  })
  isAdminRole: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_dealer_role',
  })
  isDealerRole: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'dealer_id',
    allowNull: true,
  })
  dealerId: string;

  @HasMany(() => SubRoleModulePermission)
  permission: SubRoleModulePermission[];

  @HasMany(() => User)
  users: User[];

  @BelongsTo(() => User)
  dealer: User;
}
