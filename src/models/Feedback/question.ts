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
import { Form } from './form';
import { QuestionOption } from './question_option';

@Table({ tableName: 'question' })
export class Question extends Model<Question> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'question_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  questionId: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  name: string;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  description: string;

  @Column({
    type: DataTypes.BOOLEAN,
    field: 'is_optional',
    defaultValue: false,
  })
  isOptional: boolean;

  @Column({
    type: DataTypes.ENUM('MULTIPLE_CHOICE', 'RATING', 'COMMENT'),
    allowNull: false,
    field: 'question_type',
  })
  questionType: string;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'comment_question_max_char',
  })
  commentQuestionMaxChar: number;

  @ForeignKey(() => Form)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'form_id' })
  formId: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_deleted',
  })
  isDeleted: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @Column({
    type: DataTypes.INTEGER,
    defaultValue: 0,
  })
  order: number;

  @BelongsTo(() => Form)
  feedbackForm: Form;

  @HasMany(() => QuestionOption)
  questionOption: QuestionOption[];
}
