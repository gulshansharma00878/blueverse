import { DataTypes } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../user';

@Table({ tableName: 'dealer_document' })
export class DealerDocument extends Model<DealerDocument> {
  @PrimaryKey
  @Column({
    type: DataTypes.UUID,
    field: 'dealer_document_id',
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  })
  dealerDocumentId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    field: 'dealer_id',
    allowNull: false,
  })
  dealerId: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  name: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  url: string;

  @Column({ type: DataTypes.BOOLEAN, allowNull: true, field: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: DataTypes.DATE, allowNull: true, field: 'deleted_at' })
  deletedAt: DataTypes.DateDataType;

  @BelongsTo(() => User)
  dealer: string;
}
