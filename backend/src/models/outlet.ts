import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { STATUS } from '../module/areaModule/constant';
import { User } from './User/user';
import { City } from './city';
import { Machine } from './Machine/Machine';
import { OutletMachine } from './outlet_machine';

@Table({ tableName: 'outlet' })
export class Outlet extends Model<Outlet> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'outlet_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  outletId: string;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.STRING, field: 'full_address' })
  address: string;

  @Column({ type: DataTypes.INTEGER, defaultValue: STATUS.ACTIVE })
  status: number;

  @ForeignKey(() => City)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'city_id' })
  cityId: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, field: 'dealer_id' })
  dealerId: string;

  @Column({ type: DataTypes.STRING, field: 'gst_no' })
  gstNo: string;

  @Column({ type: DataTypes.STRING })
  latitude: string;

  @Column({ type: DataTypes.STRING })
  longitude: string;

  @BelongsTo(() => User)
  dealer: User;

  @HasMany(() => Machine)
  machines: Machine[];

  @BelongsTo(() => City)
  city: City;

  @HasMany(() => OutletMachine)
  outletMachine: [OutletMachine];

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_two_wheeler',
    defaultValue: false,
  })
  isTwoWheeler: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_four_wheeler',
    defaultValue: false,
  })
  isFourWheeler: boolean;
}
