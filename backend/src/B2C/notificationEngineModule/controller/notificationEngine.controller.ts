import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { NotificationEngineService } from '../services/notificationEngine.service';
import {
  getNotificationStatus,
  isNullOrUndefined,
} from '../../../common/utility';
import { RepeatScheduleType } from '../../models/notification_engine';
import { config } from '../../../config/config';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';

import moment from 'moment';

/**
 * NotificationEngineController Class
 *
 * This class defines methods for handling notification engine-related requests.
 * Each method corresponds to a specific endpoint for creating, retrieving, updating, and deleting notification engines.
 */
export class NotificationEngineController {
  constructor() {}

  // Method to add a new notification engine
  async addNewNotificationEngine(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
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

      // Constructing the request body
      const body = {
        notificationName,
        notificationContent,
        cityId,
        subscriptionType,
        thumbnailUrl,
        scheduleDateTime,
        repeatSchedule,
        customStartDate,
        customEndDate,
        repeatEvery,
        repeatUnit,
        isTwoWheeler,
        isFourWheeler,
      };
      if (repeatSchedule !== RepeatScheduleType.CUSTOM) {
        body['customStartDate'] = null;
        body['repeatEvery'] = null;
        body['repeatUnit'] = null;
        body['customEndDate'] = null;
      }
      // Calling service to add a new notification engine
      const newNotification =
        await NotificationEngineService.addNewNotificationEngine(body);

      // Adding the notification city
      await NotificationEngineService.addNotificationEngineCity(
        newNotification.notificationEngineId,
        city,
        false
      );

      if (newNotification && !isNullOrUndefined(badges) && badges.length > 0) {
        await NotificationEngineService.addNotificationBadges(
          newNotification.notificationEngineId,
          badges
        );
      }

      // Preparing the response
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Notification engine'),
        body: {
          data: newNotification,
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to update notification engine details
  async updateNotificationEngineDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const {
        notificationName,
        notificationContent,
        cityId,
        city,
        subscriptionType,
        vehicleType,
        thumbnailUrl,
        scheduleDateTime,
        repeatSchedule,
        customStartDate,
        customEndDate,
        repeatEvery,
        repeatUnit,
        notificationEngineId,
        badges,
        isTwoWheeler,
        isFourWheeler,
      } = dataFromRequest(req);

      // Constructing the updated notification body (currently empty)
      const updatedNotificationBody: any = {};
      if (!isNullOrUndefined(notificationName)) {
        updatedNotificationBody['notificationName'] = notificationName;
      }
      if (!isNullOrUndefined(notificationContent)) {
        updatedNotificationBody['notificationContent'] = notificationContent;
      }
      if (!isNullOrUndefined(cityId)) {
        updatedNotificationBody['cityId'] = cityId;
      }
      if (!isNullOrUndefined(subscriptionType)) {
        updatedNotificationBody['subscriptionType'] = subscriptionType;
      }
      if (!isNullOrUndefined(isTwoWheeler)) {
        updatedNotificationBody['isTwoWheeler'] = isTwoWheeler;
      }
      if (!isNullOrUndefined(isFourWheeler)) {
        updatedNotificationBody['isFourWheeler'] = isFourWheeler;
      }
      if (!isNullOrUndefined(vehicleType)) {
        updatedNotificationBody['vehicleType'] = vehicleType;
      }
      if (!isNullOrUndefined(thumbnailUrl)) {
        updatedNotificationBody['thumbnailUrl'] = thumbnailUrl;
      }
      if (!isNullOrUndefined(scheduleDateTime)) {
        updatedNotificationBody['scheduleDateTime'] = scheduleDateTime;
      }

      if (!isNullOrUndefined(customStartDate)) {
        updatedNotificationBody['customStartDate'] = customStartDate;
      }
      if (!isNullOrUndefined(customEndDate)) {
        updatedNotificationBody['customEndDate'] = customEndDate;
      }
      if (!isNullOrUndefined(repeatEvery)) {
        updatedNotificationBody['repeatEvery'] = repeatEvery;
      }
      if (!isNullOrUndefined(repeatUnit)) {
        updatedNotificationBody['repeatUnit'] = repeatUnit;
      }
      if (!isNullOrUndefined(repeatSchedule)) {
        updatedNotificationBody['repeatSchedule'] = repeatSchedule;
        if (repeatSchedule != RepeatScheduleType.CUSTOM) {
          updatedNotificationBody['customStartDate'] = null;
          updatedNotificationBody['customEndDate'] = null;
          updatedNotificationBody['repeatEvery'] = null;
          updatedNotificationBody['repeatUnit'] = null;
        }
      }

      if (city && city.length) {
        // Adding the notification city
        await NotificationEngineService.addNotificationEngineCity(
          notificationEngineId,
          city,
          true
        );
      }

      await NotificationEngineService.updateNotificationBody(
        updatedNotificationBody,
        notificationEngineId
      );
      if (badges && !isNullOrUndefined(badges)) {
        await NotificationEngineService.updateNotificationBadges(
          notificationEngineId,
          badges
        );
      }
      // Preparing the response
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Notification engine'),
        body: {},
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get details of a specific notification engine by ID
  async getNotificationEngineDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const { notificationEngineId } = dataFromRequest(req);

      // Calling service to get notification engine details
      const notificationDetails =
        await NotificationEngineService.notificationEngineDetails(
          notificationEngineId
        );

      // Preparing the response
      res.locals.response = {
        message: templateConstants.DETAIL('Notification engine'),
        body: {
          data: notificationDetails,
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get a list of notification engines
  async getNotificationEngineList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const { limit, offset, search, sortBy, orderBy } = dataFromRequest(req); // Extract parameters from the request
      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        limit: _limit,
        offset: _offset,
        search,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };

      // Calling service to get notification engine details (list function should be used instead of details)
      const notifications = await NotificationEngineService.getNotificationList(
        queryBody
      );
    

      // Preparing the response
      res.locals.response = {
        message: templateConstants.LIST_OF('Notification engine'),
        body: {
          data: {
            notifications: notifications.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              notifications.count
            ), // Format pagination data
          },
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get a list of notification engines
  async getNotificationEngineExport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const { search, sortBy, orderBy } = dataFromRequest(req); // Extract parameters from the request
      const queryBody = {
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        search,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };

      // Calling service to get notification engine details (list function should be used instead of details)
      const { rows, count } =
        await NotificationEngineService.getNotificationList(queryBody);

      let result: any = [];
      let csvFields: any = [];
      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < count; i++) {
        const status = getNotificationStatus(rows[i].lastNotificationDate);
        result.push({
          'Sr.No': i + 1, // Serial number
          'Notification Name': rows[i].notificationName,
          'Notification Content': rows[i].notificationContent,
          // Region: rows[i]?.city?.state?.region?.name,
          // State: rows[i]?.city?.state?.name,
          // City: rows[i]?.city?.name,
          Vehicle: `${rows[i].isTwoWheeler ? 'Two Wheeler' : ''} ${
            rows[i].isFourWheeler ? 'Four Wheeler' : ''
          }`, // Number of vehicles added by the customer
          'Date & Time': `${
            !isNullOrUndefined(rows[i].lastNotificationDate)
              ? moment(rows[i].lastNotificationDate)
                  .tz('Asia/Kolkata')
                  .format('MMM DD YYYY [at] hh:mm A')
              : ''
          }`,
          Status: status,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Notification Name',
        'Notification Content',
        'Region',
        'State',
        'City',
        'Vehicle',
        'Date & Time',
        'Status',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'NotificationEngine.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Preparing the response
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('Notification engine'), // Success message
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to delete a specific notification engine by ID
  async deleteNotificationEngine(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const { notificationEngineId } = dataFromRequest(req);

      // Calling service to delete the notification engine
      await NotificationEngineService.deleteNotificationEngine(
        notificationEngineId
      );

      // Preparing the response
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Notification'),
        body: {},
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async resendNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationEngineId } = dataFromRequest(req);
      //  fetch notification engine details
      const notificationDetails =
        await NotificationEngineService.notificationEngineDetails(
          notificationEngineId
        );
      //if detail exist then send notifications
      if (notificationDetails) {
        NotificationEngineService.sendNotification(notificationDetails);
      }
      res.locals.response = {
        message: templateConstants.SEND_SUCCESSFULLY('Notification'),
        body: {},
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create instance of NotificationEngineController
const notificationEngineController = new NotificationEngineController();
export { notificationEngineController };
