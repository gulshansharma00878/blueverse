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

export enum WasteType {
  'SLUDGE' = 'SLUDGE',
  'TREATED_TANK' = 'TREATED_TANK',
  'COLLECTED_TANK' = 'COLLECTED_TANK',
}

@Table({ tableName: 'water_quality_report' })
export class WaterQualityReport extends Model<WaterQualityReport> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  water_quality_report_id: string;

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
  sampling_date: Date;

  @Column({ allowNull: true, type: DataTypes.DATE })
  report_date: Date;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  tds_value: number;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  tss_value: number;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  cod_value: number;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  bod_value: number;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  ph_value: number;

  @Column({ allowNull: true, type: DataTypes.FLOAT, defaultValue: 0 })
  oil_grease_value: number;

  @Column({ allowNull: true, type: DataTypes.STRING })
  lab_report_url: string;

  // This column stores the number of washes that have occurred between two reporting events. Default value is set to 0.
  @Column({ allowNull: true, type: DataTypes.INTEGER, defaultValue: 0 })
  wash_count_between_reports: number;

  // This column keeps a cumulative count of all washes from start of the year to the current report. Default value is set to 0.
  @Column({ allowNull: true, type: DataTypes.INTEGER, defaultValue: 0 })
  cummulative_wash_count: number;
}
