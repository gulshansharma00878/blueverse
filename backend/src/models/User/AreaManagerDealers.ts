import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user';

@Table({ tableName: 'area_manager_dealer' })
export class AreaManagerDealers extends Model<AreaManagerDealers> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'area_manager_dealer_id',
  })
  areaManagerDealerId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'area_manager_id',
  })
  areaManagerId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'dealer_id',
  })
  dealerId: string;

  @BelongsTo(() => User, 'areaManagerId')
  areaManager: User;

  @BelongsTo(() => User, 'dealerId')
  dealer: User;
}
