import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { EscalationContacts } from './EscalationContacts';
import { HealthMatrix } from '../HealthMatrix';
import { Machine } from '../Machine/Machine';

@Table({ tableName: 'escalation_matrix' })
export class EscalationMatrix extends Model<EscalationMatrix> {
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

  @ForeignKey(() => HealthMatrix)
  @Column({ type: DataTypes.UUID })
  AlarmGuid: string;

  @ForeignKey(() => EscalationContacts)
  @Column({ type: DataTypes.UUID })
  EscalationContactGuid: string;

  @Column({ type: DataTypes.INTEGER, allowNull: true })
  SortOrder: number;

  @Column({ type: DataTypes.INTEGER, allowNull: true })
  EscalationInterval: number;

  @BelongsTo(() => Machine)
  machine: Machine;

  @BelongsTo(() => HealthMatrix)
  alarm: HealthMatrix;

  @BelongsTo(() => EscalationContacts)
  EscalationContacts: EscalationContacts;
}
