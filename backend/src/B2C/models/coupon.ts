import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  AutoIncrement,
  BeforeCreate,
} from 'sequelize-typescript';

@Table({ tableName: 'coupon' })
export class Coupon extends Model<Coupon> {
  // Primary key using UUID, with default value generated as UUIDV4
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'coupon_id',
  })
  couponId: string;

  @Column({
    type: DataType.STRING,
    // allowNull: false,
    field: 'unique_id',
  })
  uniqueId: string; // Changed type to number

  // Name of the coupon
  @Column({
    type: DataType.STRING,
    field: 'coupon_name',
  })
  couponName: string;

  // Description of the coupon
  @Column({
    type: DataType.STRING,
    field: 'coupon_description',
  })
  couponDescription: string;

  // Minimum order value to use the coupon
  @Column({
    type: DataType.INTEGER,
    field: 'min_order_Value',
    defaultValue: 0,
  })
  minOrderValue: number;

  // Indicates if the coupon is unlimited
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_unlimited',
    defaultValue: false,
  })
  isUnlimited: boolean;

  // Minimum order value to use the coupon
  @Column({
    type: DataType.INTEGER,
    field: 'quantity',
    allowNull: true,
  })
  quantity: number;

  @Column({
    type: DataType.INTEGER,
    field: 'usage_count',
    defaultValue: 0,
  })
  usageCount: number;

  // Start date of the coupon's validity period
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'start_date',
  })
  startDate: Date;

  // End date of the coupon's validity period
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'end_date',
  })
  endDate: Date;

  // Discount percentage offered by the coupon
  @Column({
    type: DataType.DECIMAL(5, 2), // Changed precision to fit values between 0 and 100
    // defaultValue: 0,
    field: 'discount_percentage',
    validate: {
      min: 0,
      max: 100,
    },
  })
  discountPercentage: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    // defaultValue: 0,
    field: 'discount_value',
  })
  discountValue: number;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    field: 'allow_multiple_time_use',
    defaultValue: true,
  })
  allowMultipleTimeUse: boolean;

  // Date when the coupon was deleted (soft delete)
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @BeforeCreate
  static async addUniqueId(instance: Coupon) {
    instance.uniqueId = await getLastUniqueId();
  }
}

const getLastUniqueId = async () => {
  try {
    const lastEntry = await Coupon.findOne({
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
