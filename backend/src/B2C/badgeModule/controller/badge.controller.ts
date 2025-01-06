import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { BadgeService } from '../services/badge.service';
import { BookingService } from '../../bookingModule/services/booking.service';
import { isNullOrUndefined } from '../../../common/utility';
import { config } from '../../../config/config';
import { CustomerService } from '../../customerModule/services/cutomer.service';

/**
 * BadgeController Class
 *
 * This class defines methods for handling badge-related requests.
 * Each method corresponds to a specific endpoint for creating, retrieving, updating, and deleting badges.
 */
export class BadgeController {
  constructor() {}

  /**
   * addNewBadge Method
   *
   * This method handles the creation of a new badge.
   * It extracts necessary data from the request, calls the BadgeService to add a new badge,
   * and prepares the response to be sent back to the client.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async addNewBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const { badgeName, badgeUrl, criteria, badgeDescription } =
        dataFromRequest(req); // Extract data from the request
      const body = {
        badgeName,
        badgeUrl,
        criteria,
        badgeDescription,
      };
      const newBadge = await BadgeService.addNewbadge(body); // Call service to add a new badge
      // Prepare response
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Badge'),
        body: {
          data: newBadge,
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  /**
   * getBadgeDetails Method
   *
   * This method retrieves the details of a specific badge by ID.
   * It extracts the badge ID from the request, calls the BadgeService to get the badge details,
   * and prepares the response to be sent back to the client.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async getBadgeDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { badgeId } = dataFromRequest(req); // Extract badge ID from the request
      const badgeDetails = await BadgeService.badgeIdExist(badgeId); // Call service to get badge details
      // Prepare response
      res.locals.response = {
        message: templateConstants.DETAIL('Badge'),
        body: {
          data: badgeDetails,
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  /**
   * updateBadgeDetails Method
   *
   * This method updates the details of a specific badge.
   * It extracts the necessary data from the request, constructs an update object,
   * calls the BadgeService to update the badge, and prepares the response to be sent back to the client.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async updateBadgeDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        badgeName,
        badgeUrl,
        criteria,
        badgeDescription,
        isActive,
        badgeId,
      } = dataFromRequest(req); // Extract data from the request

      const updatedBadge: any = {};
      if (!isNullOrUndefined(badgeName)) {
        updatedBadge['badgeName'] = badgeName;
      }
      if (!isNullOrUndefined(badgeUrl)) {
        updatedBadge['badgeUrl'] = badgeUrl;
      }
      if (!isNullOrUndefined(criteria)) {
        updatedBadge['criteria'] = criteria;
      }
      if (!isNullOrUndefined(badgeDescription)) {
        updatedBadge['badgeDescription'] = badgeDescription;
      }
      if (!isNullOrUndefined(isActive)) {
        updatedBadge['isActive'] = isActive;
      }
      const newBadge = await BadgeService.updateBadge(updatedBadge, badgeId); // Call service to update the badge
      // Prepare response
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Badge'),
        body: {
          data: newBadge,
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  /**
   * deleteBadge Method
   *
   * This method handles the deletion of a specific badge by ID.
   * It extracts the badge ID from the request, calls the BadgeService to delete the badge,
   * and prepares the response to be sent back to the client.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async deleteBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const { badgeId } = dataFromRequest(req); // Extract badge ID from the request
      await BadgeService.deleteBadge(badgeId); // Call service to delete the badge
      // Prepare response
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Badge'),
        body: {},
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  /**
   * getBadgeList Method
   *
   * This method retrieves a list of badges with pagination and optional search and sorting parameters.
   * It extracts pagination and search parameters from the request, formats them, calls the BadgeService to get the badge list,
   * and prepares the response to be sent back to the client.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async getBadgeList(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, search, sortBy, orderBy, isActive } =
        dataFromRequest(req); // Extract parameters from the request
      let activeStatus: any = null;
      if (!isNullOrUndefined(isActive)) {
        activeStatus = isActive === 'true';
      }
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
            : 'desc', // Default order by 'desc',
        isActive: activeStatus,
      };
      const badges = await BadgeService.getBadgeList(queryBody); // Call service to get badge list
      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Badge'),
        body: {
          data: {
            badges: badges.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              badges.count
            ), // Format pagination data
          },
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  /**
   * getAssignedBadgeCustomerList Method
   *
   * This method retrieves a list of customer assigned with badge with pagination and optional search and sorting parameters.
   * It extracts pagination and search parameters from the request, formats them, calls the BadgeService to get the badge list,
   * and prepares the response to be sent back to the client.
   *
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {NextFunction} next - The next middleware function
   */
  async getAssignedBadgeCustomerList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { limit, offset, search, sortBy, orderBy, badgeId } =
        dataFromRequest(req); // Extract parameters from the request
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

      const badges = await BadgeService.getAssignedBadgeCustomerList(
        queryBody,
        badgeId
      ); // Call service to get badge list
      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Customer'),
        body: {
          data: {
            badges: badges.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              badges.count
            ), // Format pagination data
          },
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async getCustomerAssigendBadges(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { limit, offset, search, sortBy, orderBy, loggedInUser } =
        dataFromRequest(req); // Extract parameters from the request
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
      //No of complete was by customer
      // const bookingCount = await BookingService.getCustomerBooking(
      //   loggedInUser.userId
      // );
      // const waterSaved = config.waterSavedPerWash * bookingCount;
      // Number  of achieved badges

      // fetch water saved through customer table
      const customerDetail = await CustomerService.getCustomerDetail(
        loggedInUser.userId
      );
      const waterSaved = Number(customerDetail.totalWaterSaved) || 0;
      // Get all the badges whose water criteria is less than the water Saved
      const badges = await BadgeService.getCustomerAssignedBadges(
        queryBody,
        loggedInUser.userId,
        waterSaved
      );

      // list of all badges whose criteria is greater than the water saved
      const unAcheivedBadges = await BadgeService.getCustomerUnAcheivedBadges(
        waterSaved,
        loggedInUser.userId
      );
      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('badges'),
        body: {
          data: {
            waterSaved: waterSaved,
            achievedBadges: badges.rows,
            unAcheivedBadges: unAcheivedBadges,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              badges.count
            ), // Format pagination data
          },
        },
      };
      next(); // Pass control to the next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create instance of BadgeController
const badgeController = new BadgeController();
export { badgeController };
