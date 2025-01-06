import { subscriptionService } from '../services/subscription.service';
import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { isNullOrUndefined } from '../../../common/utility';
import { config } from '../../../config/config';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';
import createHttpError from 'http-errors';
export class SubscriptionController {
  private subscriptionService: typeof subscriptionService;
  constructor() {
    this.subscriptionService = subscriptionService;
  }

  // Asynchronous method to handle adding money to a user's wallet
  async addSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const data = dataFromRequest(req);

      // Calling the service method to add money to the wallet
      const subscription = await this.subscriptionService.addSubscription(data);

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Subscriptions'),
        body: {
          data: {
            merchantDetails: subscription,
          },
        },
      };
      // Calling next middleware function
      next();
    } catch (err) {
      next(err);
    }
  }

  async getSubscriptionList(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const {
        limit,
        offset,
        sortBy,
        orderBy,
        search,
        loggedInUser,
        startDate,
        endDate,
        vehicleType
      } = dataFromRequest(req); // Extract pagination and sorting parameters from request
      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody: any = {
        limit: _limit,
        offset: _offset,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc',
        search: !isNullOrUndefined(search) ? search.trim() : search,
        showSubscribedCustomerCount: true,
        startDate: startDate,
        endDate: endDate,
        vehicleType:vehicleType
      };

      // if role is customer
      if (!isNullOrUndefined(loggedInUser?.userId)) {
        queryBody['isActive'] = true;
        queryBody['showSubscribedCustomerCount'] = false;
      }

      const subscriptions = await this.subscriptionService.getSubscriptionList(
        queryBody
      );

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.LIST_OF('Subscriptions'),
        body: {
          data: {
            subscriptionsList: subscriptions.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              subscriptions.count
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getSubscribedCustomerList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request using a utility function
      const { limit, offset, sortBy, orderBy, search, subscriptionId, startDate, endDate } =
        dataFromRequest(req); // Extract pagination and sorting parameters from request
      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody: any = {
        limit: _limit,
        offset: _offset,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc',
        search: !isNullOrUndefined(search) ? search.trim() : search,
        startDate: startDate,
        endDate: endDate,
      };

      const subscriptions =
        await this.subscriptionService.getSubscribedCustomerList(
          queryBody,
          subscriptionId
        );

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.LIST_OF('subscribed customer'),
        body: {
          data: {
            subscriptionsList: subscriptions.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              subscriptions.count
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // Asynchronous method to handle adding money to a user's wallet
  async buySubscription(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const data = dataFromRequest(req);

      // Destruct the data
      const { loggedInUser, subscriptionId } = data;

      // Calling the service method to add money to the wallet
      await this.subscriptionService.buySubscription(
        subscriptionId,
        loggedInUser.userId
      );

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.ADDED_SUCCESSFULLY('Subscriptions'),
        body: {
          data: {},
        },
      };
      // Calling next middleware function
      next();
    } catch (err) {
      next(err);
    }
  }

  async getSubscriptionDetail(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const { subscriptionId } = dataFromRequest(req); // Extract pagination and sorting parameters from request

      const subscription =
        await this.subscriptionService.getSubscriptionDetails(subscriptionId);

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.DETAIL('Subscriptions'),
        body: {
          data: {
            subscription: subscription,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const { subscriptionId } = dataFromRequest(req); // Extract pagination and sorting parameters from request

      await this.subscriptionService.deleteSubscription(subscriptionId);

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Subscriptions'),
        body: {},
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateSubscriptionsDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request using a utility function
      const {
        subscriptionId,
        subscriptionName,
        subscriptionDescription,
        price,
        silverWashOffered,
        goldWashOffered,
        platinumWashOffered,
        silverServiceOffered,
        goldServiceOffered,
        platinumServiceOffered,
        subscriptionDays,
        subscriptionCreatedOn,
        isActive,
        vehicleType,
      } = dataFromRequest(req); // Extract pagination and sorting parameters from request
      const subscriptionBody: any = {};
      if (!isNullOrUndefined(subscriptionName)) {
        subscriptionBody['subscriptionName'] = subscriptionName;
      }
      if (!isNullOrUndefined(subscriptionDescription)) {
        subscriptionBody['subscriptionDescription'] = subscriptionDescription;
      }
      if (!isNullOrUndefined(price)) {
        subscriptionBody['price'] = price;
      }

      if (!isNullOrUndefined(silverWashOffered)) {
        subscriptionBody['silverWashOffered'] = silverWashOffered;
      }
      if (!isNullOrUndefined(goldWashOffered)) {
        subscriptionBody['goldWashOffered'] = goldWashOffered;
      }
      if (!isNullOrUndefined(platinumWashOffered)) {
        subscriptionBody['platinumWashOffered'] = platinumWashOffered;
      }
      if (!isNullOrUndefined(silverServiceOffered)) {
        subscriptionBody['silverServiceOffered'] = silverServiceOffered;
      }
      if (!isNullOrUndefined(goldServiceOffered)) {
        subscriptionBody['goldServiceOffered'] = goldServiceOffered;
      }
      if (!isNullOrUndefined(platinumServiceOffered)) {
        subscriptionBody['platinumServiceOffered'] = platinumServiceOffered;
      }
      if (!isNullOrUndefined(subscriptionDays)) {
        subscriptionBody['subscriptionDays'] = subscriptionDays;
      }
      if (!isNullOrUndefined(subscriptionCreatedOn)) {
        subscriptionBody['subscriptionCreatedOn'] = subscriptionCreatedOn;
      }
      if (!isNullOrUndefined(isActive)) {
        subscriptionBody['isActive'] = isActive;
      }
      if (!isNullOrUndefined(vehicleType)) {
        subscriptionBody['vehicleType'] = vehicleType;
      }

      await this.subscriptionService.updateSubscriptionDetail(
        subscriptionId,
        subscriptionBody
      );

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Subscriptions'),
        body: {},
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getSubscriptionListForCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request using a utility function
      const { limit, offset, sortBy, orderBy, search } = dataFromRequest(req); // Extract pagination and sorting parameters from request
      const { _limit, _offset } = paginatorParamFormat(limit, offset); // Format pagination parameters
      const queryBody = {
        limit: _limit,
        offset: _offset,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc',
        search: !isNullOrUndefined(search) ? search.trim() : search,
      };

      const subscriptions = await this.subscriptionService.getSubscriptionList(
        queryBody
      );

      // Setting a success response message
      res.locals.response = {
        message: templateConstants.LIST_OF('Subscriptions'),
        body: {
          data: {
            subscriptionsList: subscriptions.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              subscriptions.count
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportSubscriptionList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request using a utility function
      const { sortBy, orderBy, search, loggedInUser, startDate, endDate } =
        dataFromRequest(req); // Extract pagination and sorting parameters from request

      const queryBody: any = {
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc',
        search: !isNullOrUndefined(search) ? search.trim() : search,
        showSubscribedCustomerCount: true,
        startDate: startDate,
        endDate: endDate,
      };

      // if role is customer
      if (!isNullOrUndefined(loggedInUser?.userId)) {
        queryBody['isActive'] = true;
        queryBody['showSubscribedCustomerCount'] = false;
      }

      const subscriptions = await this.subscriptionService.getSubscriptionList(
        queryBody
      );

      let data: any = subscriptions.rows;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        result.push({
          'Sr.No': i + 1, // Serial number
          'Subscription Name': `${data[i]?.dataValues?.subscriptionName} `,
          Price: data[i]?.dataValues?.price,
          Offerings: `${data[i]?.dataValues?.silverWashOffered} Silver | ${data[i]?.dataValues?.goldWashOffered} Gold | ${data[i]?.dataValues?.platinumWashOffered} Platinum `,
          'Vehicle Type': data[i]?.dataValues?.vehicleType,
          Users: data[i]?.dataValues?.subscribedCustomerCount,
          'Created Date': data[i]?.dataValues?.createdAt,
          Status: data[i]?.dataValues?.isActive ? 'Active' : 'Inactive',
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Subscription Name',
        'Price',
        'Offerings',
        'Vehicle Type',
        'Users',
        'Created Date',
        'Status',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'SubscriptionManagement.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE(
          'Subscription Management'
        ), // Success message
      };

      // Call the next middleware or function

      next();
    } catch (err) {
      next(err);
    }
  }

  async exportSubscribedUsersList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request using a utility function
      const { sortBy, orderBy, search, loggedInUser, startDate, endDate, subscriptionId} =
        dataFromRequest(req); // Extract pagination and sorting parameters from request

      const queryBody: any = {
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc',
        search: !isNullOrUndefined(search) ? search.trim() : search,
        showSubscribedCustomerCount: true,
        startDate: startDate,
        endDate: endDate,
      };

      // if role is customer
      if (!isNullOrUndefined(loggedInUser?.userId)) {
        queryBody['isActive'] = true;
        queryBody['showSubscribedCustomerCount'] = false;
      }

      const subscriptions = await this.subscriptionService.getSubscribedCustomerList(
        queryBody,
        subscriptionId
      );

      let data: any = subscriptions.rows;
      if(data?.length == 0) {
        throw createHttpError(400, CONSTANT.SUBSCRIBED_USERS_NOT_FOUND);
      }

      let result: any = [];
      let csvFields: any = [];

      for (let i = 0; i < data.length; i++) {
        const subscription = data[i]?.dataValues;
        const customer = subscription?.customer?.dataValues;
        // Add subscription and customer details to the result array
        result.push({
          'Sr.No': i + 1,
          'User Name': customer?.firstName + ' ' + customer?.lastName,
          Offered: `${subscription?.silverWash} Silver | ${subscription?.goldWash} Gold | ${subscription?.platinumWash} Platinum`,
          Actual: `${subscription?.remainingSilverWash} Silver | ${subscription?.remainingGoldWash} Gold | ${subscription?.remainingPlatinumWash} Platinum`,
          'Phone Number': customer?.countryCode + ' ' + customer?.phone,
          'Subscription Bought': subscription?.createdAt,
          'Expiry Date': subscription?.expiryDate,
        });
      }
  
      // Define the fields/columns for the CSV file
      csvFields = [
        'Sr.No',
        'User Name',
        'Offered',
        'Actual',
        'Phone Number',
        'Subscription Bought',
        'Expiry Date',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file with the current timestamp
      const fileName = `SubscribedCustomersList.csv`;

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE(
          'Subscribed Customers'
        ), // Success message
      };

      // Call the next middleware or function

      next();
    } catch (err) {
      next(err);
    }
  }
}

const subscriptionController = new SubscriptionController();
export { subscriptionController };
