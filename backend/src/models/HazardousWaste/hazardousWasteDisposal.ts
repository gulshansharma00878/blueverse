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
import { Machine } from '../Machine/Machine';

export enum WasteType {
  'SLUDGE' = 'SLUDGE',
}

@Table({ tableName: 'hazardous_waste_disposal' })
export class HazardousWasteDisposal extends Model<HazardousWasteDisposal> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  hazardous_waste_disposal_id: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID, allowNull: false })
  machine_id: string;

  @BelongsTo(() => Machine)
  machine: Machine;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM(...Object.values(WasteType)),
    defaultValue: WasteType.SLUDGE,
  })
  waste_type: string;

  @Column({ allowNull: true, type: DataTypes.DATE })
  desposing_date: Date;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  total_waste_bag_weight: number; //Disposal waste bag weights

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  collected_waste_weight: number; // net amount of collected waste before disposed

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  remaining_collected_waste_weight: number; // remaining amount of collected waste after disposal

  @Column({ allowNull: true, type: DataTypes.STRING })
  form_url: string;
}
