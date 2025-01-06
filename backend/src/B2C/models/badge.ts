import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  BeforeCreate,
} from 'sequelize-typescript';

@Table({ tableName: 'badge' })
export class Badge extends Model<Badge> {
  // Primary key using UUID, with default value generated as UUIDV4
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'badge_id',
  })
  badgeId: string;

  @Column({
    type: DataType.STRING,
    field: 'unique_id',
  })
  uniqueId: string; // Changed type to number

  // Name of the coupon
  @Column({
    type: DataType.STRING,
    field: 'badge_name',
  })
  badgeName: string;

  // Name of the coupon
  @Column({
    type: DataType.STRING,
    field: 'badge_description',
  })
  badgeDescription: string;
  // Name of the coupon
  @Column({
    type: DataType.STRING,
    field: 'badge_url',
  })
  badgeUrl: string;

  // Minimum order value to use the coupon
  @Column({
    type: DataType.INTEGER,
    field: 'criteria',
    allowNull: true,
  })
  criteria: number;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  })
  isActive: boolean;

  // Date when the coupon was deleted (soft delete)
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @BeforeCreate
  static async addUniqueId(instance: Badge) {
    instance.uniqueId = await getLastUniqueId();
  }
}

const getLastUniqueId = async () => {
  try {
    const lastEntry = await Badge.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['uniqueId', 'createdAt'],
    });
    let newSerialNo = '001';
    if (lastEntry && !!lastEntry.uniqueId) {
      const number = lastEntry.uniqueId.split('/');
      const newNumber = Number(number.at(-1)) + 1;
      if (newNumber.toString().length < 3) {
        newSerialNo = ('00' + newNumber).slice(-3);
      } else {
        newSerialNo = newNumber.toString();
      }
    }

    return newSerialNo;
  } catch (err) {
    console.error(err);
  }
};
