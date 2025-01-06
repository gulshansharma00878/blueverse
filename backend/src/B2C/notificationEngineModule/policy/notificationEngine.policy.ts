import { NextFunction, Request, Response } from 'express';
import { NotificationEngineService } from '../services/notificationEngine.service';
import { cityService } from '../../../module/areaModule/services/city.service';
import { BadgeService } from '../../badgeModule/services/badge.service';
import { dataFromRequest } from '../../../helpers/basic_helper';
import createHttpError from 'http-errors';
import { templateConstants } from '../../../common/templateConstants';
import { isValidGuid, getUniqueValidUUIDs } from '../../../common/utility';

/**
 * ValidateNotificationEngine Class
 *
 * This class provides methods to validate various aspects of notification engine-related requests,
 * such as checking if a notification engine ID is valid.
 */
class ValidateNotificationEngine {
  private notificationEngineService: typeof NotificationEngineService;
  private cityService: typeof cityService;

  constructor() {
    this.notificationEngineService = NotificationEngineService; // Initialize the NotificationEngineService
    this.cityService = cityService;
  }

  /**
   * Validate Notification Engine ID
   *
   * This method validates the notification engine ID present in the request.
   * It checks if the ID is a valid GUID and if it exists in the database.
   *
   * @param req - The express request object
   * @param res - The express response object
   * @param next - The next middleware function
   */
  async validateNotificationEngineId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting notification engine ID from the request
      const { notificationEngineId } = dataFromRequest(req);
      
      console.log("🚀 ~ ValidateNotificationEngine ~ notificationEngineId:", notificationEngineId)
      // Check if the notification engine ID is a valid GUID
      if (!isValidGuid(notificationEngineId)) {
        throw createHttpError(
          400,
          templateConstants.INVALID('notification engine id')
        );
      }

      console.log("🚀 ~ ValidateNotificationEngine ~ notificationEngineId:", notificationEngineId)
      // Check if the notification engine ID exists in the database
      const notificationDetails =
        await this.notificationEngineService.notificationEngineIdExist(
          notificationEngineId
        );
      if (!notificationDetails) {
        throw createHttpError(
          400,
          templateConstants.INVALID('notification engine id')
        );
      }

      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateNewNotificationEngine(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        notificationName,
        notificationContent,
        cityId,
        city,
        isTwoWheeler,
        isFourWheeler,
        subscriptionType,
        badges,
        thumbnailUrl,
        scheduleDateTime,
        repeatSchedule,
        customStartDate,
        repeatEvery,
        repeatUnit,
        customEndDate,
      } = dataFromRequest(req);

      // validate name already exists or not
      const notificationEngine =
        await this.notificationEngineService.notificationEngineNameExist({
          notificationName,
        });
      if (notificationEngine) {
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST('notification engine name') 
        );
      }

      if (city.length) {
        
        for (let i in city) {
          // validate city id
          const cityDetails = await this.cityService.cityExist(city[i]);
          if (!cityDetails) {
            throw createHttpError(400, templateConstants.INVALID('cityId'));
          }
        }
      }else{
        throw createHttpError(400, templateConstants.INVALID('city'));
      }

      // validate badge id
      if (badges.length) {
        const uniqueBadgeIds = getUniqueValidUUIDs(badges);
        if (uniqueBadgeIds.length > 0) {
          const badgeCount = await BadgeService.badgesCount(uniqueBadgeIds);
          if (badgeCount != uniqueBadgeIds.length) {
            throw createHttpError(400, templateConstants.INVALID('badges'));
          }
        }
      }

      console.log("🚀 ~ ValidateNotificationEngine ~ city:", city)

      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create an instance of the validation class and export it
const validateNotificationEngine = new ValidateNotificationEngine();
export { validateNotificationEngine };
