import { DataTypes } from 'sequelize'
import { Model, Column, Table, PrimaryKey } from 'sequelize-typescript'

@Table({ tableName: 'feedback_form' })
export class FeedbackForm extends Model<FeedbackForm> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'form_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  formId: string

  @Column({ type: DataTypes.STRING, allowNull: false })
  name: string

  @Column({ type: DataTypes.STRING, allowNull: true })
  description: string

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    field: 'is_deleted',
  })
  isDeleted: DataTypes.DateDataType

  @Column({ type: DataTypes.UUID, allowNull: false, field: 'created_by' })
  createdBy: string

  @Column({
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
    field: 'deleted_by',
  })
  deletedBy: string
}
