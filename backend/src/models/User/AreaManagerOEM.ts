import { machine } from 'os';
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
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user';
import { OEM } from '../oem';

@Table({ tableName: 'area_manager_oem' })
export class AreaManagerOEM extends Model<AreaManagerOEM> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'area_manager_oem_id',
  })
  areaManagerOEMId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'area_manager_id',
  })
  areaManagerId: string;

  @ForeignKey(() => OEM)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'oem_id' })
  oemId: string;

  @BelongsTo(() => User)
  user: User;
  @BelongsTo(() => OEM)
  oem: OEM;
}
