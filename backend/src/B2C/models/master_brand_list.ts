import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

// Table to store additional service name for mechant
@Table({ tableName: 'master_brand_list' })
export class MasterBrandList extends Model<MasterBrandList> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    field: 'brand_id',
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  brandId: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_two_wheeler',
    defaultValue: false,
  })
  isTwoWheeler: boolean;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_four_wheeler',
    defaultValue: false,
  })
  isFourWheeler: boolean;
}
