import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { AdditonalSeriveService } from '../services/additionalService.service';
import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { isNullOrUndefined } from '../../../common/utility';
import { updateAdditionalServiceBody } from '../types/additionService.type';

// Controller class for handling additional service-related requests
export class AdditionalSeriveController {
  private additonalSeriveService: typeof AdditonalSeriveService;

  // Constructor to initialize the service
  constructor() {
    this.additonalSeriveService = AdditonalSeriveService;
  }

  // Method to add a new additional service
  async addAdditonalService(req: Request, res: Response, next: NextFunction) {
    try {
      const { additionalServiceName, isTwoWheeler, isFourWheeler } =
        dataFromRequest(req); // Extract data from request
      const body = {
        name: additionalServiceName,
        isTwoWheeler,
        isFourWheeler,
      };
      await this.additonalSeriveService.addAdditionalService(body); // Call service method to add additional service
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Additional service'),
        body: {
          body,
        },
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get the list of additional services
  async getAdditionalServiceList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { limit, offset, sortBy, orderBy, isTwoWheeler, isFourWheeler } =
        dataFromRequest(req); // Extract pagination and sorting parameters from request
      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        limit: _limit,
        offset: _offset,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
        isTwoWheeler,
        isFourWheeler,
      };
      const additionalServiceList =
        await this.additonalSeriveService.getAdditionalServiceList(queryBody); // Call service method to get additional services
      res.locals.response = {
        message: templateConstants.LIST_OF('Additional Service'),
        body: {
          data: {
            additionalServiceList: additionalServiceList.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              additionalServiceList.count
            ), // Format pagination data
          },
        },
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get the details of a specific additional service
  async getAdditionalServiceDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { additionalServiceId } = dataFromRequest(req); // Extract additional service ID from request
      const additionalServiceDetail =
        await this.additonalSeriveService.getAdditionalServiceDetails(
          additionalServiceId
        ); // Call service method to get additional service details
      res.locals.response = {
        message: templateConstants.DETAIL('Additional Service'),
        body: {
          data: {
            additionalServiceDetail: additionalServiceDetail,
          },
        },
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to update the details of a specific additional service
  async updateAdditionalServiceDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        additionalServiceName,
        isActive,
        additionalServiceId,
        isTwoWheeler,
        isFourWheeler,
      } = dataFromRequest(req); // Extract data from request
      const body: updateAdditionalServiceBody = {};
      if (!isNullOrUndefined(additionalServiceName)) {
        body['name'] = additionalServiceName; // Update service name if provided
      }
      if (!isNullOrUndefined(isActive)) {
        body['isActive'] = isActive; // Update service active status if provided
      }
      if (!isNullOrUndefined(isTwoWheeler)) {
        body['isTwoWheeler'] = isTwoWheeler;
      }
      if (!isNullOrUndefined(isFourWheeler)) {
        body['isFourWheeler'] = isFourWheeler;
      }

      await this.additonalSeriveService.updateAdditionalServiceDetails(
        body,
        additionalServiceId
      ); // Call service method to update additional service details
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Additional Service'),
        body: {},
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to delete a specific additional service
  async deleteAdditionalService(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { additionalServiceId } = dataFromRequest(req); // Extract additional service ID from request
      await this.additonalSeriveService.deleteAdditionalService(
        additionalServiceId
      ); // Call service method to delete additional service

      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Additional Service'),
        body: {},
      };
      next(); // Pass control to next middleware
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create an instance of the controller and export it
const additionalSeriveController = new AdditionalSeriveController();
export { additionalSeriveController };
