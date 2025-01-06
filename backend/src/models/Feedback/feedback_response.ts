import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { TransactionsFeedback } from './TransactionsFeedback';
import { Question } from './question';
import { QuestionOption } from './question_option';

@Table({ tableName: 'feedback_response' })
export class FeedbackResponse extends Model<FeedbackResponse> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'feedback_response_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  feedbackResponseId: string;

  @ForeignKey(() => TransactionsFeedback)
  @Column({
    type: DataTypes.UUID,
    field: 'transaction_feedback_id',
    allowNull: false,
  })
  transactionFeedbackId: string;
  @BelongsTo(() => TransactionsFeedback)
  transactionFeedback: TransactionsFeedback;

  @ForeignKey(() => Question)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'question_id' })
  questionId: string;

  @ForeignKey(() => QuestionOption)
  @Column({
    type: DataTypes.UUID,
    allowNull: true,
    field: 'question_option_id',
  })
  questionOptionId: string;

  @Column({ type: DataTypes.STRING, allowNull: false, field: 'question_text' })
  questionText: string;

  @Column({
    type: DataTypes.STRING,
    field: 'question_response',
  })
  questionResponse: string;

  @BelongsTo(() => Question)
  question: Question;
}
