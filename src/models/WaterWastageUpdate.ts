import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Machine } from './Machine/Machine';

@Table({ tableName: 'water_wastage_update' })
export class WaterWastageUpdate extends Model<WaterWastageUpdate> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'Guid',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  Guid: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID })
  MachineGuid: string;

  @Column({ type: DataTypes.DECIMAL(10, 2) })
  WaterWastage: DataTypes.DecimalDataType;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  UpdateDate: DataTypes.DateDataType;

  @BelongsTo(() => Machine)
  Machine: Machine;
}
