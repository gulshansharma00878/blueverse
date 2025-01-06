import { DataTypes, Op } from 'sequelize';
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  DataType,
  HasMany,
  BeforeCreate,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Vehicle } from './vehicle';
import { Subscription } from './subscription';
import { Referral } from './reffer';
import { CustomerDeviceToken } from './customerDeviceToken';
import { City } from '../../models/city';
import { State } from '../../models/state';

@Table({ tableName: 'customer' })
export class Customer extends Model<Customer> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, allowNull: false, field: 'customer_id' })
  customerId: string;

  // @Column({ allowNull: true, type: DataTypes.STRING })
  // username: string;
  @Column({ allowNull: true, field: 'first_name', type: DataTypes.STRING })
  firstName: string;

  @Column({ allowNull: true, field: 'last_name', type: DataTypes.STRING })
  lastName: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  email: string;

  @Column({ allowNull: true, type: DataTypes.STRING })
  password: true;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  phone: string;

  @Column({ field: 'country_code', defaultValue: '+91' })
  countryCode: string;

  @Column({ type: DataTypes.STRING,allowNull: true, })
  address: string;

  @Column({ type: DataTypes.STRING,allowNull: true, })
  pincode: string;

  @Column({ type: DataTypes.STRING,allowNull: true, })
  gender: string;

  @Column({ type: DataTypes.STRING })
  city: string;

  @Column({ type: DataTypes.STRING })
  state: string;

  @HasMany(() => Vehicle)
  vehicle: Vehicle[];

  @ForeignKey(() => Subscription) // Define the foreign key for the Subscription association
  @Column({ type: DataType.UUID, allowNull: true, field: 'subscription_id' })
  subscriptionId: string;

  @BelongsTo(() => Subscription)
  subscription: Subscription;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_water_saved',
  })
  totalWaterSaved: number; // Amount of water saved by the customer

  @Column({
    type: DataType.ARRAY(DataType.JSONB),
    allowNull: true,
    field: 'badges',
  })
  badges: object[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_points',
  })
  totalPoints: number; // total points

  // 0- Not Active  1- for Active  2-Deactivated by Admin
  @Column({
    type: DataType.INTEGER,
    field: 'is_active',
    defaultValue: 0,
  })
  isActive: number;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
    field: 'is_deleted',
    defaultValue: false,
  })
  isDeleted: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
    field: 'deleted_by',
  })
  deletedBy: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
    field: 'last_login',
  })
  lastLogin: Date;

  @Column({
    type: DataTypes.STRING,
    field: 'unique_id',
  })
  uniqueId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
    field: 'user_referral_code',
  })
  userReferralCode: string;

  @HasMany(() => Referral, 'referrerUserId')
  referralsMade: Referral[];

  @HasMany(() => CustomerDeviceToken)
  customerDeviceToken: CustomerDeviceToken[];

  @BeforeCreate
  static async addUniqueId(instance: Customer) {
    instance.uniqueId = await getCustomerUniqueId();
  }

  @Column({ allowNull: true, field: 'image', type: DataTypes.STRING })
  image: string;

  @Column({ type: DataTypes.BOOLEAN, defaultValue: false })
  is_social_login: boolean;

  @Column({ allowNull: true, type: DataTypes.STRING })
  unique_key: string;


  @ForeignKey(() => City) // Define the foreign key for the Subscription association
  @Column({ type: DataType.UUID, allowNull: true, field: 'city_id' })
  cityId: string;

  @BelongsTo(() => City)
  cityDetails: City;

  @ForeignKey(() => State) // Define the foreign key for the Subscription association
  @Column({ type: DataType.UUID, allowNull: true, field: 'state_id' })
  stateId: string;

  @BelongsTo(() => State)
  stateDetails: State;
}



const getCustomerUniqueId = async () => {
  // Fetch the most recently created customer with a non-null 'createdAt' field
  const customerData = await Customer.findOne({
    where: {
      createdAt: { [Op.ne]: null }, // Exclude null values
    },
    order: [['createdAt', 'DESC']], // Order by 'createdAt' in descending order to get the latest record
    attributes: ['uniqueId', 'createdAt'], // Only select 'uniqueId' and 'createdAt' fields
  });

  const format = 'BVCS/'; // Prefix for the unique ID
  let newSerialNo = '00001'; // Default serial number if no previous uniqueId is found

  // If a customer record is found and it has a 'uniqueId'
  if (customerData && !!customerData.uniqueId) {
    const number = customerData.uniqueId.split('/'); // Split the 'uniqueId' by '/'
    const newNumber = Number(number.at(-1)) + 1; // Increment the serial number by 1

    // Ensure the new serial number has at least 5 digits
    if (newNumber.toString().length < 5) {
      newSerialNo = ('0000' + newNumber).slice(-5); // Pad with leading zeros if necessary
    } else {
      newSerialNo = newNumber.toString(); // Convert to string if it already has 5 or more digits
    }
  }

  // Return the new unique ID with the prefix and the formatted serial number
  return format + newSerialNo;
};
