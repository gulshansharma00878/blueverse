import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../User/user';
import { Machine } from './Machine';
import { Form } from '../Feedback/form';

@Table({ tableName: 'machine_agents' })
export class MachineAgent extends Model<MachineAgent> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'machine_agent_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  machineAgentId: string;

  @ForeignKey(() => Machine)
  @Column({ type: DataTypes.UUID, field: 'machine_id' })
  machineId: string;

  @BelongsTo(() => Machine)
  machine: {};

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, field: 'agent_id' })
  agentId: string;

  @BelongsTo(() => User)
  agent: {};

  @ForeignKey(() => Form)
  @Column({ type: DataTypes.UUID, field: 'form_id' })
  formId: string;

  @BelongsTo(() => Form)
  form: {};
}
