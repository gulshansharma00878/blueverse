import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  HasMany,
  BeforeCreate,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Machine } from '../../models/Machine/Machine';
import { MerchantPricingTerm } from './merchant_pricing_term';
import { MerchantAdditionalServicePrice } from './merchant_additional_service_price';
import { MerchantImages } from './merchant_images';
import { MerchantHoliday } from './merchant_holiday';
import { VehicleType } from '../models/vehicle';
import { City } from '../../models/city';

@Table({ tableName: 'merchant' })
export class Merchant extends Model<Merchant> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'merchant_id',
  })
  merchantId: string;

  @Column({ type: DataType.STRING, allowNull: true }) //selected banner image
  bannerImageUrl: string;

  @Column({ type: DataType.STRING, allowNull: true }) //service center name
  outletName: string;

  @Column({ type: DataType.STRING, allowNull: true }) //service center address
  address: string;

  @Column({ type: DataType.FLOAT, allowNull: true }) //service center latitude
  latitude: number;

  @Column({ type: DataType.FLOAT, allowNull: true }) //service center longitude
  longitude: number;

  @Column({ allowNull: true, type: DataType.TIME })
  operationStartTime: string;

  @Column({ allowNull: true, type: DataType.TIME })
  operationEndTime: string;

  @Column({ allowNull: true, type: DataType.TIME })
  runningStartTime: string;

  @Column({ allowNull: true, type: DataType.TIME })
  runningEndTime: string;

  @Column({ allowNull: true, type: DataType.DATE })
  closingStartTime: Date;

  @Column({ allowNull: true, type: DataType.DATE })
  closingEndTime: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'created_at' })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'updated_at' })
  updatedAt: Date;

  // Vehicle type for the notification
  @Column({
    type: DataType.ENUM(...Object.values(VehicleType)),
    // allowNull: false,
    field: 'vehicle_type',
  })
  vehicleType: VehicleType;

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
    type: DataType.STRING,
    field: 'unique_id',
  })
  uniqueId: string;

  @ForeignKey(() => City)
  @Column({ type: DataType.UUID, field: 'city_id' })
  cityId: string;

  @HasMany(() => Machine) //assigned machines
  machines: Machine[];

  @HasMany(() => MerchantPricingTerm) //service center pricing terms
  pricingTerms: MerchantPricingTerm[];

  @HasMany(() => MerchantAdditionalServicePrice) //service center pricing terms
  merchantAdditionalServicePrice: MerchantAdditionalServicePrice[];

  @HasMany(() => MerchantImages) //merchant images
  merchantImages: MerchantImages[];

  @HasMany(() => MerchantHoliday) //merchant images
  merchantHolidays: MerchantHoliday[];

  @BelongsTo(() => City) //merchant city
  city: City;

  @BeforeCreate
  static async addUniqueId(instance: Merchant) {
    instance.uniqueId = await getMachineWalletUniqueId();
  }
}

const getMachineWalletUniqueId = async () => {
  const lastEntry = await Merchant.findOne({
    order: [['createdAt', 'DESC']],
    attributes: ['uniqueId', 'createdAt'],
  });

  const format = 'BV/SC/';
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
  return format + newSerialNo;
};
