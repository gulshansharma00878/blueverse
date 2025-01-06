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
import { State } from './state';
import { STATUS } from '../module/areaModule/constant';
import { Form } from './Feedback/form';
import { UserArea } from './User/UserArea';

@Table({ tableName: 'city' })
export class City extends Model<City> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'city_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  cityId: string;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.INTEGER, defaultValue: STATUS.ACTIVE })
  status: number;

  @ForeignKey(() => State)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'state_id' })
  stateId: string;

  @BelongsTo(() => State)
  state: State;

  @HasMany(() => Form)
  serviceFeedbackForm: Form[];

  @HasMany(() => UserArea)
  userArea: UserArea[];
}
