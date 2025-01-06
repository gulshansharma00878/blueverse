import { Joi } from 'express-validation';
import {
  SubscriptionType,
  RepeatScheduleType,
  RepeatUnitType,
} from '../../models/notification_engine';

export const newNotificationEngine = Joi.object({
  notificationName: Joi.string().required(), // ID of wash type
  notificationContent: Joi.string().required(), // Price for wash
  cityId: Joi.string().trim().guid().required(), // Price for manpower
  subscriptionType: Joi.string()
    .trim()
    .allow(SubscriptionType.SUBSCRIBED, SubscriptionType.UNSUBSCRIBED),
  isTwoWheeler: Joi.boolean().required(),
  isFourWheeler: Joi.boolean().required(),
  thumbnailUrl: Joi.string().trim().required(),
  scheduleDateTime: Joi.date().required(),
  repeatSchedule: Joi.string()
    .trim()
    .allow(
      RepeatScheduleType.CUSTOM,
      RepeatScheduleType.DAILY,
      RepeatScheduleType.DO_NOT_REPEAT,
      RepeatScheduleType.MONTHLY,
      RepeatScheduleType.WEEKLY,
      RepeatScheduleType.YEARLY
    )
    .required(),
  customStartDate: Joi.date().allow(null).optional(),
  customEndDate: Joi.date().allow(null).optional(),
  repeatEvery: Joi.number().allow(null).optional(),
  repeatUnit: Joi.string().allow(
    null,
    RepeatUnitType.DAYS,
    RepeatUnitType.MONTHS,
    RepeatUnitType.WEEK
  ),
  badges: Joi.array().items(Joi.string().guid()).min(1).required(),
});
