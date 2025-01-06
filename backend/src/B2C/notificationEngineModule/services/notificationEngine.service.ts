import { Op, WhereOptions } from 'sequelize';
import { Badge } from '../../models/badge';
import {
  NotificationEngine,
  RepeatScheduleType,
  RepeatUnitType,
  SubscriptionType,
} from '../../models/notification_engine';
import { City } from '../../../models/city';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { Customer } from '../../models/customer';
import { Vehicle, VehicleType } from '../../models/vehicle';
import moment from 'moment';
import { isNullOrUndefined } from '../../../common/utility';
import { NotificationEngineBadge } from '../../models/notification_engine_badeges';
import { CustomerNotification } from '../../models/customerNotification';
import { BookingService } from '../../bookingModule/services/booking.service';
import {
  sendFirebaseNotification,
  sendFirebaseNotificationWithData,
} from '../../../services/common/firebaseService/firebaseNotification';
import sequelize from 'sequelize/types/sequelize';
import db from '../../../models';
import { CustomerBadge } from '../../models/customer_badge';
import { NotificationCity } from '../../models/notification_city';
/**
 * Service class for handling notification engine-related operations
 *
 * This class provides methods to interact with the NotificationEngine model,
 * performing operations such as adding, updating, deleting, and querying notification engines.
 */
class NotificationEngineServices {
  /**
   * Add a new notification engine
   *
   * @param body - The data for the new notification engine
   * @returns The created notification engine object
   */
  async addNewNotificationEngine(body: any) {
    try {
      // Create notification engine record
      return await NotificationEngine.create(body);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async addNotificationBadges(notificationEnginId: string, badges: string[]) {
    try {
      type BodyType = {
        notificationEngineId: string;
        badgeId: string;
      };
      const body: BodyType[] = [];
      badges.forEach((badgeId: string) => {
        body.push({
          notificationEngineId: notificationEnginId,
          badgeId: badgeId,
        });
      });
      if (body.length > 0) {
        await NotificationEngineBadge.bulkCreate(body);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateNotificationBadges(
    notificationEnginId: string,
    badges: string[]
  ) {
    try {
      // Remove the provious relation of this notification engine
      await NotificationEngineBadge.destroy({
        where: {
          notificationEngineId: notificationEnginId,
        },
      });
      type BodyType = {
        notificationEngineId: string;
        badgeId: string;
      };
      const body: BodyType[] = [];
      badges.forEach((badgeId: string) => {
        body.push({
          notificationEngineId: notificationEnginId,
          badgeId: badgeId,
        });
      });
      // create new notification engine and badges realtions
      if (body.length > 0) {
        await NotificationEngineBadge.bulkCreate(body);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get details of a notification engine by ID
   *
   * @param notificationEngineId - The ID of the notification engine
   * @returns The details of the notification engine including related city, state, and region information
   */
  async notificationEngineDetails(notificationEngineId: string) {
    try {
      return await NotificationEngine.findOne({
        where: {
          notificationEngineId: notificationEngineId,
        },
        include: [
          {
            model: NotificationCity,
            include: [
              {
                model: City,
                attributes: ['cityId', 'name'],
                include: [
                  {
                    model: State,
                    attributes: ['stateId', 'name'],
                    include: [
                      {
                        model: Region,
                        attributes: ['regionId', 'name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: NotificationEngineBadge,
            attributes: ['notificationEngineBadgeId', 'badgeId'],
            include: [
              {
                model: Badge,
                attributes: ['badgeId', 'badgeName'],
              },
            ],
          },
        ],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateNotificationBody(updatedBody: any, notificationEngineId: string) {
    try {
      await NotificationEngine.update(updatedBody, {
        where: {
          notificationEngineId: notificationEngineId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * Soft delete a notification engine by ID
   *
   * @param notificationEngineId - The ID of the notification engine
   * @returns void
   */
  async deleteNotificationEngine(notificationEngineId: string) {
    try {
      // Delete all entries in NotificationCity that are linked to the given notificationEngineId
      await NotificationCity.destroy({
        where: {
          notificationEngineId: notificationEngineId,
        },
      });

      // Mark the NotificationEngine entry as deleted by updating the 'deletedAt' field with the current date
      await NotificationEngine.update(
        {
          deletedAt: new Date(),
        },
        {
          where: {
            notificationEngineId: notificationEngineId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Check if a notification engine ID exists and is not deleted
   *
   * @param notificationEngineId - The ID of the notification engine
   * @returns The notification engine object if it exists and is not deleted, otherwise null
   */
  async notificationEngineIdExist(notificationEngineId: string) {
    try {
      return await NotificationEngine.findOne({
        where: {
          notificationEngineId: notificationEngineId,
          deletedAt: null,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async notificationEngineNameExist(notificationBody: {
    notificationName: string;
    notificationEngineId?: string;
  }) {
    try {
      const { notificationName, notificationEngineId } = notificationBody;
      const whereCondition: any = {
        notificationName: notificationName,
        deletedAt: null,
      };
      if (!isNullOrUndefined(notificationEngineId)) {
        whereCondition['notificationEngineId'] = notificationEngineId;
      }
      return await NotificationEngine.findOne({
        where: whereCondition,
        attributes: ['notificationEngineId'],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getNotificationList(queryBody: any) {
    try {
      const { limit, offset, search, sortBy, orderBy } = queryBody;
      const whereCondition: WhereOptions = {
        deletedAt: null, // Ensure only non-deleted badges are retrieved
      };
      if (search) {
        whereCondition['notificationName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`, // Add search filter for badge name
        };
      }

      return await NotificationEngine.findAndCountAll({
        where: whereCondition, // Use your dynamic filter here
        distinct: true, // Ensures a distinct count on the main model
        include: [
          {
            model: NotificationCity, // Make sure NotificationCity is included
            include: [
              {
                model: City,
                attributes: ['cityId', 'name'], // Include required attributes
                include: [
                  {
                    model: State,
                    attributes: ['stateId', 'name'], // Include State details
                    include: [
                      {
                        model: Region,
                        attributes: ['regionId', 'name'], // Include Region details
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        limit, // Limit the number of results
        offset, // Offset for pagination
        order: [[sortBy, orderBy]], // Ordering based on passed parameters
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async sendNotification(notification: any) {
    try {
      // send push and app notifications
      this.sendNotificationsToCustomer(notification);
      // Update Notification Engine
      const currentDate = new Date();
      await NotificationEngine.update(
        {
          lastNotificationDate: currentDate,
          // scheduleDateTime: newScheduleDate,
        },
        {
          where: {
            notificationEngineId: notification.notificationEngineId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getNewNotificationDate(notification: any, currentDate: string | Date) {
    let nextDate = null;
    const currentMoment = moment(currentDate);

    switch (notification.repeatSchedule) {
      case RepeatScheduleType.DO_NOT_REPEAT:
        nextDate = null;
        break;

      case RepeatScheduleType.DAILY:
        nextDate = currentMoment.add(1, 'days');
        break;

      case RepeatScheduleType.WEEKLY:
        nextDate = currentMoment.add(7, 'days');
        break;

      case RepeatScheduleType.MONTHLY:
        nextDate = currentMoment.add(1, 'months');
        break;

      case RepeatScheduleType.YEARLY:
        nextDate = currentMoment.add(1, 'years');
        break;

      case RepeatScheduleType.CUSTOM:
        switch (notification.repeatUnit) {
          case RepeatUnitType.DAYS:
            nextDate = currentMoment.add(
              Number(notification.repeatEvery),
              'days'
            );
            break;

          case RepeatUnitType.WEEK:
            nextDate = currentMoment.add(
              Number(notification.repeatEvery),
              'weeks'
            );
            break;

          case RepeatUnitType.MONTHS:
            nextDate = currentMoment.add(
              Number(notification.repeatEvery),
              'months'
            );
            break;

          default:
            nextDate = null;
        }

        // If nextDate exceeds the custom end date, set it to null
        if (
          nextDate &&
          moment(nextDate).isAfter(moment(notification.customEndDate))
        ) {
          nextDate = null;
        }
        break;

      default:
        nextDate = null;
    }

    return nextDate ? nextDate.toDate() : null;
  }

  // function for cron job
  async sendNotificationEngineNotification() {
    try {
      const currentDate = moment().format('YYYY-MM-DD HH:mm');

      // Fetch all relevant notification engines in a single query
      const notificationEngines = await NotificationEngine.findAll({
        where: {
          scheduleDateTime: currentDate,
          isActive: true,
          deletedAt: null,
        },
        include: [
          {
            model: NotificationEngineBadge,
            attributes: ['notificationEngineBadgeId', 'badgeId'],
            include: [
              {
                model: Badge,
                attributes: ['badgeId', 'badgeName'],
              },
            ],
          },
        ],
      });

      // Use a transaction to ensure atomicity of updates
      await db.sequelize.transaction(async (transaction: any) => {
        const notifications = notificationEngines.map(
          async (notificationEngine: any) => {
            // Send notification
            await this.sendNotificationsToCustomer(notificationEngine);

            // Calculate the next schedule date
            const nextScheduleDate = this.getNewNotificationDate(
              notificationEngine,
              currentDate
            );

            // Update schedule and last notification date
            return NotificationEngine.update(
              {
                scheduleDateTime: nextScheduleDate,
                lastNotificationDate: moment(
                  currentDate,
                  'YYYY-MM-DD HH:mm'
                ).toDate(),
              },
              {
                where: {
                  notificationEngineId: notificationEngine.notificationEngineId,
                },
                transaction, // Ensure the update is part of the transaction
              }
            );
          }
        );

        // Wait for all notifications to be processed
        await Promise.all(notifications);
      });
    } catch (err) {
      // Handle and log errors appropriately
      console.error('Error in sendNotificationEngineNotification:', err);
      throw err; // Reject the promise with the error
    }
  }

  // Send notification to all customer related to notification engine
  async sendNotificationsToCustomer(notification: any) {
    try {
      const {
        notificationEngineId,
        notificationName,
        notificationContent,
        cityId,
        subscriptionType,
        isTwoWheeler,
        isFourWheeler,
        thumbnailUrl,
        notificationBadges,
      } = notification;

      const badgeIdArr = notificationBadges.map((badge: any) => badge.badgeId);
      const customerWhereCondition: any = {};
      const vehicleCondition: any = {
        deletedAt: null,
        isDeleted: false,
      };

      // If there are badges, filter customers based on those badges
      if (badgeIdArr.length) {
        const customerBadges = await CustomerBadge.findAll({
          attributes: ['customerId'],
          where: {
            badgeId: {
              [Op.in]: badgeIdArr,
            },
          },
          raw: true,
        });
        const customerIdArr = customerBadges.map((cb) => cb.customerId);
        if (customerIdArr.length) {
          vehicleCondition['customerId'] = {
            [Op.in]: customerIdArr,
          };
        }
      }

      // Subscription check
      customerWhereCondition['subscriptionId'] =
        subscriptionType === SubscriptionType.SUBSCRIBED
          ? { [Op.ne]: null }
          : { [Op.eq]: null };

      // City filter
      if (cityId) {
        // customerWhereCondition['cityId'] = cityId;
      }

      const notificationCity: any = await this.getAllCityForNotification(
        notificationEngineId
      );

      if (notificationCity && notificationCity.length > 0) {
        customerWhereCondition['cityId'] = { [Op.in]: notificationCity };
      }

      // Vehicle type condition
      if (isTwoWheeler && isFourWheeler) {
        vehicleCondition['vehicleType'] = VehicleType.ALL;
      } else if (isTwoWheeler) {
        vehicleCondition['vehicleType'] = VehicleType.TWO_WHEELER;
      } else if (isFourWheeler) {
        vehicleCondition['vehicleType'] = VehicleType.FOUR_WHEELER;
      }

      // Fetch vehicles and corresponding customers
      const vehicles = await Vehicle.findAll({
        attributes: ['customerId'],
        where: vehicleCondition,
        raw: true,
      });

      const customerIds = vehicles.map((vehicle) => vehicle.customerId);

      if (customerIds.length) {
        customerWhereCondition['customerId'] = { [Op.in]: customerIds };
      }

      // Get customers based on the conditions
      const customers = await Customer.findAll({
        where: customerWhereCondition,
        raw: true,
      });

      // Send notifications to customers
      if (customers.length) {
        const customerNotifications = customers.map(async (customer: any) => {
          await CustomerNotification.create({
            customerId: customer.customerId,
            description: notificationContent,
            title: notificationName,
            isCancel: true,
            imageUrl: thumbnailUrl,
          });

          const deviceTokens = await BookingService.getCustomerDeviceToken(
            customer.customerId
          );

          if (deviceTokens.length) {
            sendFirebaseNotificationWithData(
              deviceTokens,
              notificationName,
              notificationContent,
              { thumbnailUrl }
            );
          }
        });

        await Promise.all(customerNotifications);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async addNotificationEngineCity(
    notificationEngineId: any,
    city: any,
    isUpdate: boolean
  ) {
    try {
      if (isUpdate) {
        await NotificationCity.destroy({
          where: {
            notificationEngineId: notificationEngineId,
          },
        });
      }
      // Prepare city insert data and batch insert
      const cityEntries = city.map((cityId: any) => ({
        notificationEngineId: notificationEngineId,
        cityId,
      }));

      console.log(
        '🚀 ~ NotificationEngineServices ~ cityEntries ~ city:',
        cityEntries
      );
      await NotificationCity.bulkCreate(cityEntries);

      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getAllCityForNotification(notificationEngineId: any) {
    try {
      const notificationData = await NotificationCity.findAll({
        where: {
          notificationEngineId: notificationEngineId,
        },
        attributes: ['cityId'], // Select only the cityId column
      });

      // Extract cityId values into an array
      const cityIds = notificationData.map((record) => record.cityId);

      return cityIds;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

// Create an instance of NotificationEngineServices and export it
const NotificationEngineService = new NotificationEngineServices();
export { NotificationEngineService };
