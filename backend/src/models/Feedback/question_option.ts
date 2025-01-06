import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Question } from './question';

@Table({ tableName: 'question_option' })
export class QuestionOption extends Model<QuestionOption> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'question_option_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  QuestionOptionId: string;

  @ForeignKey(() => Question)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'question_id' })
  questionId: string;

  @BelongsTo(() => Question)
  question: Question;

  @Column({ type: DataTypes.STRING, allowNull: false })
  text: string;

  @Column({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
  order: number;
}
