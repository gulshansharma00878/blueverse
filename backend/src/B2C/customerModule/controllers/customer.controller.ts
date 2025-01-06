import { Request, Response, NextFunction } from 'express';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';

import stringConstants from '../../../common/stringConstants';
import { messageService } from '../../../services/common/messageService';
import { CustomerService } from '../services/cutomer.service';
import { config } from '../../../config/config';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';
import { templateConstants } from '../../../common/templateConstants';
import { CustomerAuthService } from '../../authModule/services/auth.service';
import { Customer } from '../../models/customer';
export class CustomerController {
  private customerService: typeof CustomerService;
  private authService: typeof CustomerAuthService;
  constructor() {
    this.customerService = CustomerService;
    this.authService = CustomerAuthService;
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);
      // Updating the customer details
      await this.customerService.updateCustomer(data, data.loggedInUser.userId);

      res.locals.response = {
        message: stringConstants.genericMessage.CUSTOMER_UPDATED,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      // Updating the customer details
      const userData: any = await this.customerService.getCustomers(
        dataFromRequest(req)
      );

      res.locals.response = {
        message: stringConstants.genericMessage.LIST_OF_CUSTOMER,
        body: { data: userData },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      let { customerId } = dataFromRequest(req);

      await this.customerService.deleteCustomer(customerId);

      const customerData = await Customer.findOne({
        where: {
          customerId: customerId,
        },
      });

      if (customerData.isActive != 2) {
        // Log out the current user
        await this.authService.logout(customerId);
      }

      res.locals.response = {
        message: CONSTANT.CUSTOMER_DELETED_SUCCESSFULLY,
        body: {},
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async customerDeactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, isActive } = dataFromRequest(req);
      await this.customerService.CustomerDeactivate(customerId, isActive);

      let message: string;

      if (req.body.isActive == CONSTANT.USER_ACTIVATED) {
        message = CONSTANT.CUSTOMER_ACTIVATED_SUCCESSFULLY;
      } else if (req.body.isActive == CONSTANT.USER_DEACTIVATED) {
        // Log out the current user
        await this.authService.logout(customerId);
        message = CONSTANT.CUSTOMER_DEACTIVATED_SUCCESSFULLY;
      }

      res.locals.response = {
        message: message,
        body: {},
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportUserCollectionReport(req: any, res: any, next: any) {
    try {
      // Set the query limit and offset for retrieving customer data
      req.body.limit = config.exportFileMaxQueryLimit;
      req.body.offset = 0;

      // Fetch customer data based on the request parameters
      const { customer }: any = await this.customerService.getCustomers(
        dataFromRequest(req)
      );

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < customer.length; i++) {
        result.push({
          'Sr.No': i + 1, // Serial number
          'First Name': customer[i].firstName,
          'Last Name': customer[i].lastName,
          'Email ID': customer[i].email,
          'Phone Number': customer[i].phone,
          'Onboarding Date': customer[i].createdAt,
          'Vehicle Added': customer[i].vehicle?.length, // Number of vehicles added by the customer
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Onboarding Date',
        'Vehicle Added',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'CustomerCollection.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('customer details'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCustomerStateCity(req: Request, res: Response, next: NextFunction) {
    try {
      // Updating the customer details
      const userData: any = await this.customerService.getCustomersStateCity();

      res.locals.response = {
        message: stringConstants.genericMessage.LIST_OF_STATE,
        body: { data: userData },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCustomersNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Getting the data from request
      const data = dataFromRequest(req);

      // Updating the customer details
      const userData: any = await this.customerService.getCustomerNotification(
        data
      );

      res.locals.response = {
        message: templateConstants.LIST_OF('Notification'),
        body: { data: userData },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async customerReadNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Getting the data from request
      const data = dataFromRequest(req);

      // Updating the customer details
      const userData: any = await this.customerService.customerReadNotification(
        data
      );

      res.locals.response = {
        message: 'Notification successfully marked read',
        body: {},
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCustomerCancelNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Getting the data from request
      const data = dataFromRequest(req);

      // Updating the customer details
      const userData: any =
        await this.customerService.getCustomerCancelNotification(data);

      res.locals.response = {
        message: templateConstants.LIST_OF('Cancel Notification'),
        body: { data: userData },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCustomersUnreadNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Getting the data from request
      const data = dataFromRequest(req);

      // Updating the customer details
      const userData: any = await this.customerService.getCustomerUnreadNotification(
        data
      );

      res.locals.response = {
        message: templateConstants.LIST_OF('Unread Notification'),
        body: { data: userData },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const customerController = new CustomerController();
export { customerController };
