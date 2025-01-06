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
import { Machine } from '../Machine/Machine';

@Table({ tableName: 'escalation_matrix_parameter' })
export class EscalationMatrixParameter extends Model<EscalationMatrixParameter> {
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

  @ForeignKey(() => EscalationContacts)
  @Column({ type: DataTypes.UUID })
  EscalationContactGuid: string;

  @Column({
    type: DataTypes.DATE,
  })
  AddDate: DataTypes.DateDataType;

  @BelongsTo(() => Machine)
  machine: Machine;

  @BelongsTo(() => EscalationContacts)
  EscalationContacts: EscalationContacts;
}
