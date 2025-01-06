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

@Table({ tableName: 'hazardous_waste_collection' })
export class HazardousWasteCollection extends Model<HazardousWasteCollection> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  hazardous_waste_collection_id: string;

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
  cleaning_date: Date;

  @Column({ type: DataTypes.JSONB, allowNull: true })
  wastage_bag_detail: any;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  total_waste_bag_weight: number;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  wash_count: number;
}
