import { DataTypes } from 'sequelize'
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript'
import { Region } from './region'
import { City } from './city'
import { STATUS } from '../module/areaModule/constant'

@Table({ tableName: 'state' })
export class State extends Model<State> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'state_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  stateId: string

  @Column({ type: DataTypes.STRING })
  name: string

  @Column({ type: DataTypes.INTEGER, defaultValue: STATUS.ACTIVE })
  status: number

  @ForeignKey(() => Region)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'region_id' })
  regionId: string

  @BelongsTo(() => Region)
  region: Region

  @HasMany(() => City)
  cities: City[]
}
