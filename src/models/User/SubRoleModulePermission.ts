import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Module } from './Module';
import { SubRole } from './SubRole';

@Table({ tableName: 'sub_role_module_permission' })
export class SubRoleModulePermission extends Model<SubRoleModulePermission> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'sub_role_module_permission_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  subRoleModulePermissionId: string;

  @ForeignKey(() => Module)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'module_id',
  })
  moduleId: string;

  @ForeignKey(() => SubRole)
  @Column({
    type: DataTypes.UUID,
    field: 'sub_role_id',
    allowNull: true,
  })
  subRoleId: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'delete_permission',
  })
  deletePermission: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'update_permission',
  })
  updatePermission: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'create_permission',
  })
  createPermission: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'view_permission',
  })
  viewPermission: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'export_permission',
  })
  exportPermission: boolean;

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

  @BelongsTo(() => SubRole)
  subRole: SubRole;

  @BelongsTo(() => Module)
  module: Module;
}
