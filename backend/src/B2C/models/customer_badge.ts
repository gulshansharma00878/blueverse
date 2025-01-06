import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Customer } from './customer';
import { Badge } from './badge';

// Table to store pricing terms for merchant
@Table({ tableName: 'customer_badge' })
export class CustomerBadge extends Model<CustomerBadge> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'customer_badge_id',
  })
  customerBadgeId: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataType.UUID, field: 'customer_id', allowNull: false })
  customerId: string;

  @ForeignKey(() => Badge)
  @Column({ type: DataType.UUID, field: 'badge_id', allowNull: false })
  badgeId: string;

  // Name of the badge
  @Column({
    type: DataType.STRING,
    field: 'badge_name',
  })
  badgeName: string;

  // Description of the badge
  @Column({
    type: DataType.STRING,
    field: 'badge_description',
  })
  badgeDescription: string;

  // Image url of the badge
  @Column({
    type: DataType.STRING,
    field: 'badge_url',
  })
  badgeUrl: string;

  // Minimum water saved to get this badge
  @Column({
    type: DataType.INTEGER,
    field: 'criteria',
    allowNull: true,
  })
  criteria: number;

  @BelongsTo(() => Customer)
  customer: Customer;

  @BelongsTo(() => Badge)
  badge: Badge;
}
