import { machine } from 'os';
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

@Table({ tableName: 'oem_manager_dealer' })
export class OEMManagerDealers extends Model<OEMManagerDealers> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'oem_manager_dealer_id',
  })
  oemManagerDealerId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'oem_manager_id',
  })
  oemManagerId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'dealer_id',
  })
  dealerId: string;

  @BelongsTo(() => User, 'oemManagerId')
  oemManager: User;

  @BelongsTo(() => User, 'dealerId')
  dealer: User;
}
