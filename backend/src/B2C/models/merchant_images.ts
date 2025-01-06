import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Merchant } from './merchant';

//Table to store all the images realted to merchants
@Table({ tableName: 'merchant_images' })
export class MerchantImages extends Model<MerchantImages> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    field: 'merchant_image_id',
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  merchantImageId: string;

  @ForeignKey(() => Merchant) //it is not required field as this image can be used in another merchant also
  @Column({ type: DataType.UUID, field: 'merchant_id', allowNull: true })
  merchantId: string;

  @Column({ type: DataType.STRING, allowNull: true }) //selected banner image
  imageUrl: string;
}
