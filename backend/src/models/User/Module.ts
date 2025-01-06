import { DataTypes } from 'sequelize';
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'module' })
export class Module extends Model<Module> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'module_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  moduleId: string;

  @Column({
    type: DataTypes.STRING(300),
    allowNull: false,
  })
  name: string;

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

  @Column({ type: DataTypes.JSONB, field: 'permissions', allowNull: true })
  permissions: [];

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
  moduleType: string;
}
