import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { templateConstants } from '../../../common/templateConstants';
import { dataFromRequest } from '../../../helpers/basic_helper';
import upload from '../../../services/common/awsService/uploadService';
import { Parser } from 'json2csv';
import { isNullOrUndefined } from '../../../common/utility';
import { config } from '../../../config/config';
import moment from 'moment';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';

export class AnalyticsController {
  private analyticsService: typeof AnalyticsService;

  constructor() {
    this.analyticsService = AnalyticsService;
  }

  /**
   * Handles requests to get booking counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async bookingCustomerCounts(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);
      const { fromDateTime, toDateTime } = data;

      // Fetch booking counts from the analytics service
      const bookingCount = await this.analyticsService.getBookingWashCounts(
        fromDateTime,
        toDateTime
      );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Booking counts'),
        body: {
          data: {
            ...bookingCount,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles requests to get vehicle type booking counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async vehicleTypeBookingCounts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);
      const { fromDateTime, toDateTime } = data;

      // Fetch vehicle type booking counts from the analytics service
      const vehicleTypeCount =
        await this.analyticsService.getVehicalTypeBookingCount(
          fromDateTime,
          toDateTime
        );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Vehical Type Count'),
        body: {
          data: {
            result: vehicleTypeCount?.result,
            totalCount: vehicleTypeCount?.totalCounts,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles requests to get subscription counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async subscriptionCounts(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);
      const { fromDateTime, toDateTime } = data;

      const startDate = moment(fromDateTime).startOf('day').toISOString()

      let endDate = moment(toDateTime).endOf('day').toISOString()

      // Fetch subscription counts from the analytics service
      const subscriptionCount = await this.analyticsService.subscriptionCount(
        startDate,
        endDate
      );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Subscription'),
        body: {
          data: {
            subscriptions: subscriptionCount,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles requests to get additional service counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async additionalServiceCounts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);
      const { fromDateTime, toDateTime } = data;

      // Fetch additional service counts from the analytics service
      const additionalService =
        await this.analyticsService.additionalServiceCount(
          fromDateTime,
          toDateTime
        );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Additional Service'),
        body: {
          data: {
            additionalService,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles requests to get service center location counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async serviceCenterLocationCounts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);
      const { location } = data;

      // Fetch service center location counts from the analytics service
      const serviceCenter =
        await this.analyticsService.serviceCenterLocationCount(location);

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Service Center'),
        body: {
          data: {
            serviceCenter,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles requests to get service center location counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async customerBookingList(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);


      let { offset, limit } = data;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      // Fetch service center location counts from the analytics service
      const { bookingData, total } = await this.analyticsService.customerBookingList(
        data
      );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.LIST_OF('Customer Booking'),
        body: {
          data: {
            bookingData: bookingData,
            pagination: paginatorService(_limit, _offset / _limit + 1, total), // Format pagination data
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles requests to get service center location counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async additionalServiceDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);

      // Fetch service center location counts from the analytics service
      const customerBooking =
        await this.analyticsService.additionalServiceDetails(data);

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.LIST_OF('Additional Service Details'),
        body: {
          data: {
            ...customerBooking,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }
  async exportCustomerBookingList(req: any, res: any, next: any) {
    try {
      const requestData = dataFromRequest(req);
      requestData.limit = config.exportFileMaxQueryLimit;
      requestData.offset = 0;

      // Fetch customer data based on the request parameters
      const customerData = await this.analyticsService.customerBookingList(
        requestData
      );

      let data: any = customerData.bookingData;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        result.push({
          'Sr.No': i + 1, // Serial number
          'User Name': `${data[i]?.first_name} ${data[i]?.last_name}`,
          'Service Center Name': data[i]?.outletName,
          Region: data[i]?.region_name,
          State: data[i]?.state_name,
          City: data[i]?.city_name,
          'Vehicle Type': data[i]?.vehicle_type, //
          'Wash Type': data[i]?.wash_type_name,
          'Booking Date': data[i]?.start_date_time,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'User Name',
        'Service Center Name',
        'Region',
        'State',
        'City',
        'Vehicle Type',
        'Wash Type',
        'Booking Date',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'CustomerList.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('Customer details'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handles requests to get subscription counts.
   * @param req - The HTTP request object
   * @param res - The HTTP response object
   * @param next - The next middleware function
   */
  async totalVehicleCountAndWashType(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Fetch subscription counts from the analytics service
      const totalVehicleCountAndWashType =
        await this.analyticsService.totalVehicleCountAndWashType();

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Total Vehicle Count And WashType'),
        body: {
          data: {
            totalVehicleCountAndWashType: totalVehicleCountAndWashType,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  async exportCustomerAdditionalList(req: any, res: any, next: any) {
    try {
      const requestData = dataFromRequest(req);
      requestData.limit = config.exportFileMaxQueryLimit;
      requestData.offset = 0;

      // Fetch customer data based on the request parameters
      const additionalServiceData =
        await this.analyticsService.additionalServiceDetails(requestData);

      let data: any = additionalServiceData.additionalService;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        result.push({
          'Sr.No': i + 1, // Serial number
          Region: data[i]?.region_name,
          State: data[i]?.state_name,
          City: data[i]?.city_name,
          'Service Center Name': data[i]?.outletName,
          Usage: data[i]?.count, //
          'Add On Amount': data[i]?.sum,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Region',
        'State',
        'City',
        'Service Center Name',
        'Usage',
        'Add On Amount',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'AdditionalService.csv';

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
          'Additional Service details'
        ), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }
  async totalAppDownloads(req: Request, res: Response, next: NextFunction) {
    try {
      const requestData = dataFromRequest(req);
      // Fetch subscription counts from the analytics service

      let { offset, limit } = requestData;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const { appDownloads, count } =
        await this.analyticsService.totalAppDownloads(requestData);

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Top Downloads'),
        body: {
          data: {
            appDownloads: appDownloads,
            pagination: paginatorService(_limit, _offset / _limit + 1, count), // Format pagination data
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }

  async exportTotalAppDownloads(req: any, res: any, next: any) {
    try {
      const requestData = dataFromRequest(req);
      requestData.limit = config.exportFileMaxQueryLimit;
      requestData.offset = 0;

      const { appDownloads, count } =
        await this.analyticsService.totalAppDownloads(requestData);

      let data: any = appDownloads;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        result.push({
          'Sr.No': i + 1, // Serial number
          Region: data[i]?.region_name,
          State: data[i]?.state,
          City: data[i]?.city,
          Date: data[i]?.createdAt,
          Downloads: data[i]?.customer_count, //
          '1st Wash': data[i]?.firstwash,
          'Never Booked': data[i]?.neverbooked,
          'Paid Wash': data[i]?.paidwash,
          'Recurring Wash': data[i]?.recurringwash,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Region',
        'State',
        'City',
        'Date',
        'Downloads',
        '1st Wash',
        'Never Booked',
        'Paid Wash',
        'Recurring Wash'

      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'AppDownloads.csv';

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
          'App Downloads'
        ), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }
}

const analyticsController = new AnalyticsController();
export { analyticsController };
