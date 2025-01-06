import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { HolidayService } from '../services/holiday.service';
import { isNullOrUndefined } from '../../../common/utility';
import moment from 'moment-timezone'; // Import moment library for date/time manipulation

/**
 * HolidayController Class
 *
 * This class defines methods for handling badge-related requests.
 * Each method corresponds to a specific endpoint for creating, retrieving, updating, and deleting badges.
 */
export class HolidayController {
  constructor() {}

  async addNewHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const { holidayName, holidayDate } = dataFromRequest(req); // Extract parameters from the request
      const body = {
        holidayName: holidayName,
        holidayDate: moment(holidayDate)
          .tz('Asia/Kolkata')
          .startOf('day')
          .toISOString(),
      };
      const holiday = await HolidayService.addNewHoliday(body);
      // Prepare response
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Holiday'),
        body: {
          data: {
            holiday,
          },
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async getHolidayList(req: Request, res: Response, next: NextFunction) {
    try {
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
      const holidays = await HolidayService.getHolidayList(queryBody);
      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('holidays'),
        body: {
          data: {
            holidays: holidays.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              holidays.count
            ), // Format pagination data
          },
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async getHolidayDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { holidayId } = dataFromRequest(req); // Extract badge ID from the request
      const Details = await HolidayService.getHolidayDetails(holidayId); // Call service to get badge details
      // Prepare response
      res.locals.response = {
        message: templateConstants.DETAIL('Holiday'),
        body: {
          data: Details,
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async updateHolidayDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { holidayId, holidayName, holidayDate } = dataFromRequest(req); // Extract badge ID from the request
      const body = {
        holidayName: holidayName,
        holidayDate: moment(holidayDate)
          .tz('Asia/Kolkata')
          .startOf('day')
          .toISOString(),
      };
      await HolidayService.updateHolidayDetail(body, holidayId); // Call service to get badge details
      // Prepare response
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Holiday'),
        body: {},
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async deleteHolidayDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { holidayId } = dataFromRequest(req); // Extract badge ID from the request
      await HolidayService.deleteHolidayDetail(holidayId); // Call service to get badge details
      // Prepare response
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Holiday'),
        body: {},
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create instance of HolidayController
const holidayController = new HolidayController();
export { holidayController };
