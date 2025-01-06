import {
  Model,
  Column,
  Table,
  PrimaryKey,
  DataType,
  Default,
  BeforeCreate,
  ForeignKey,
  Index,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { City } from '../../models/city';
import { VehicleType } from '../models/vehicle';
import { NotificationEngineBadge } from './notification_engine_badeges';
import { NotificationCity } from './notification_city';

export enum SubscriptionType {
  SUBSCRIBED = 'SUBSCRIBED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

export enum RepeatScheduleType {
  DO_NOT_REPEAT = 'DO_NOT_REPEAT',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum RepeatUnitType {
  DAYS = 'DAYS',
  WEEK = 'WEEK',
  MONTHS = 'MONTHS',
}
// Define the NotificationEngine model
@Table({ tableName: 'notification_engine' })
export class NotificationEngine extends Model<NotificationEngine> {
  // Primary key using UUID, with default value generated as UUIDV4
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'notification_engine_id',
  })
  notificationEngineId: string;

  @Column({
    type: DataType.STRING,
    field: 'unique_id',
  })
  uniqueId: string;

  // Name of the notification
  // @Index({
  //   name: 'notification_engine_notification_name_idx',
  // })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'notification_name',
  })
  notificationName: string;

  // Content of the notification
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'notification_content',
  })
  notificationContent: string;

  // // Identifier for the city related to the notification
  // @ForeignKey(() => City)
  // @Column({
  //   type: DataType.UUID,
  //   allowNull: true,
  //   field: 'city_id',
  // })
  // cityId: string;

  // Subscription type for the notification
  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionType)),
    allowNull: false,
    field: 'subscription_type',
  })
  subscriptionType: SubscriptionType;

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

  // URL or path of the thumbnail image for the notification
  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'thumbnail_url',
  })
  thumbnailUrl: string;

  // Date and time when the notification is scheduled
  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'schedule_date_time',
  })
  scheduleDateTime: Date;

  // Repeat schedule type for the notification
  @Column({
    type: DataType.ENUM(...Object.values(RepeatScheduleType)),
    allowNull: false,
    field: 'repeat_schedule',
    defaultValue: RepeatScheduleType.DO_NOT_REPEAT,
  })
  repeatSchedule: RepeatScheduleType;

  // Start date for custom repeat schedule
  @Column({
    type: DataType.DATE,
    field: 'custom_start_date',
    allowNull: true,
  })
  customStartDate: Date;

  // End date for custom repeat schedule
  @Column({
    type: DataType.DATE,
    field: 'custom_end_date',
    allowNull: true,
  })
  customEndDate: Date;

  // Interval for custom repeat schedule
  @Column({
    type: DataType.INTEGER,
    field: 'repeat_every',
    allowNull: true,
  })
  repeatEvery: number;

  // Unit for the repeat interval (days or months)
  @Column({
    type: DataType.ENUM(...Object.values(RepeatUnitType)),
    field: 'repeat_unit',
    allowNull: true,
  })
  repeatUnit: RepeatUnitType;

  // Key to store last notification date
  @Column({
    type: DataType.DATE,
    field: 'last_notification_date',
    allowNull: true,
  })
  lastNotificationDate: Date;

  // Indicates if the notification is active
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  })
  isActive: boolean;

  // Date when the notification was deleted (soft delete)
  @Column({
    allowNull: true,
    type: DataType.DATE,
    field: 'deleted_at',
  })
  deletedAt: Date;

  // @BelongsTo(() => City)
  // city: City;

  @HasMany(() => NotificationEngineBadge)
  notificationBadges: NotificationEngineBadge;
  // Hook to add a unique ID before creating a new notification
  @BeforeCreate
  static async addUniqueId(instance: NotificationEngine) {
    instance.uniqueId = await getLastUniqueId();
  }

  @HasMany(() => NotificationCity)
  notificationCities: NotificationCity[];
}

// Function to generate a new unique ID for each notification
const getLastUniqueId = async (): Promise<string> => {
  try {
    const lastEntry = await NotificationEngine.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['uniqueId', 'createdAt'],
    });

    let newSerialNo = '001';
    if (lastEntry && lastEntry.uniqueId) {
      const number = lastEntry.uniqueId.split('/');
      const newNumber = Number(number.at(-1)) + 1;
      newSerialNo = newNumber.toString().padStart(3, '0');
    }

    return newSerialNo;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
