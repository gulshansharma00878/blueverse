import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';

import { MerchantService } from '../services/merchant.service';
import { machineService } from '../../../module/machineModule/services/machine.service';
import { userService } from '../../../module/userModule/services/user.service';
import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { BookingService } from '../../bookingModule/services/booking.service';

import { isNullOrUndefined } from '../../../common/utility';
import db from '../../../models/index';
import moment from 'moment';
import { config } from '../../../config/config';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';

export class MerchantController {
  private merchantService: typeof MerchantService;
  private machineService: typeof machineService;
  private userService: typeof userService;
  private bookingService: typeof BookingService;
  constructor() {
    // Initialize services
    this.merchantService = MerchantService;
    this.machineService = machineService;
    this.userService = userService;
    this.bookingService = BookingService;
  }

  // Method to add a new merchant
  async addMerchant(req: Request, res: Response, next: NextFunction) {
    let transaction;

    try {
      // Extract data from request body
      const {
        bannerImageUrl,
        outletName,
        address,
        latitude,
        longitude,
        operationStartTime,
        operationEndTime,
        runningStartTime,
        runningEndTime,
        closingStartTime,
        closingEndTime,
        pricingTerms,
        additionalServices,
        machineAgents,
        images,
        holidays,
        vehicleType,
        cityId,
      } = dataFromRequest(req);

      // Create merchant object
      const merchantBody = {
        bannerImageUrl,
        outletName,
        address,
        latitude,
        longitude,
        operationStartTime,
        operationEndTime,
        runningStartTime,
        runningEndTime,
        closingStartTime,
        closingEndTime,
        vehicleType,
        cityId,
      };

      const machineIds = machineAgents.map(
        (machineAgent: any) => machineAgent.machineId
      );

      transaction = await db.sequelize.transaction(); // Assuming you're using Sequelize for database operationsProperty 'transaction' does not exist on type 'typeof Sequelize'.ts
      // Add the new merchant
      let newMerchant;
      newMerchant = await this.merchantService.addMerchant(merchantBody, {
        transaction,
      });
      if (newMerchant) {
        const machineIds = machineAgents.map(
          (machineAgent: any) => machineAgent.machineId
        );
        // Prepare promises for the sub-operations
        const promises: any = [
          // Add pricing terms for the merchant
          this.merchantService.addMerchantPricingTerms(
            pricingTerms,
            newMerchant.merchantId,
            transaction
          ),

          // Update machines associated with the merchant
          this.machineService.updateMachinesMerchant(
            machineIds,
            newMerchant.merchantId,
            transaction
          ),

          // Update agents associated with the machines
          this.merchantService.assignedMachineAgents(machineAgents),
        ];

        if (
          !isNullOrUndefined(additionalServices) &&
          additionalServices.length
        ) {
          promises.push(
            // Add additional services for the merchant
            this.merchantService.addMerchantAdditionServices(
              additionalServices,
              newMerchant.merchantId,
              transaction
            )
          );
        }
        if (!isNullOrUndefined(images) && images.length > 0) {
          promises.push(
            this.merchantService.addMerchantImages(
              images,
              newMerchant.merchantId,
              transaction
            )
          );
        }

        if (!isNullOrUndefined(holidays) && holidays.length > 0) {
          promises.push(
            this.merchantService.addMerchantHolidays(
              holidays,
              newMerchant.merchantId,
              transaction
            )
          );
        }
        await Promise.all(promises);
      }

      // Commit the transaction
      await transaction.commit();

      // Prepare response
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('merchant'),
        body: {
          merchant: newMerchant,
        },
      };
      next();
    } catch (err) {
      if (transaction) {
        // Rollback the transaction in case of error
        await transaction.rollback();
      }
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get details of a merchant
  async getMerchantList(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        limit,
        offset,
        sortBy,
        orderBy,
        search,
        state,
        city,
        region,
        machineIds,
        startDate,
        endDate,
      } = dataFromRequest(req); // Extract pagination and sorting parameters from request
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
        state: state,
        city: city,
        region: region,
        startDate: startDate,
        endDate: endDate,
        machineIds:machineIds,
      };

      const merchants = await this.merchantService.getMerchantList(queryBody);

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Merchants'),
        body: {
          data: {
            merchantsList: merchants.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              merchants.count
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get details of a merchant
  async getMerchantDetails(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract merchant ID from request
      const { merchantId } = dataFromRequest(req);

      // Retrieve full details of the merchant
      const merchants = await this.merchantService.getMerchantFullDetails(
        merchantId
      );

      // Prepare response
      res.locals.response = {
        message: templateConstants.DETAIL('Merchant'),
        body: {
          data: {
            merchantDetails: merchants,
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get details of a merchant
  async getAvailableMachines(req: Request, res: Response, next: NextFunction) {
    try {
      // Retrieve list of available machines for merchant
      const machines = await this.merchantService.getMachinesForMerchant();

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('available machines'),
        body: {
          data: {
            machines: {
              totalCount: machines.count,
              machines: machines.rows,
            },
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async getAvailableAgents(req: Request, res: Response, next: NextFunction) {
    try {
      // Retrive list of available agents for merchants
      const agents = await this.merchantService.getAgentsForMerchant();
      // Prepare response
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Merchant details'),
        body: {
          data: {
            machines: {
              totalCount: agents.count,
              agents: agents.rows,
            },
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get details of a merchant
  async deleteMerchant(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract merchant ID from request
      const { merchantId } = dataFromRequest(req);

      // delete  details of the merchant
      const merchants = await this.merchantService.deleteMerchant(merchantId);

      // Prepare response
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Merchant'),
        body: {},
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get details of a merchant
  async updateMerchantStatus(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract merchant ID from request
      const { merchantId, isActive } = dataFromRequest(req);

      // delete  details of the merchant
      await this.merchantService.updateMerchantStatus(merchantId, isActive);
      let responseMessage =
        templateConstants.ACTIVATED_SUCCESSFULLY('Merchant');
      if (isActive === false) {
        responseMessage =
          templateConstants.DEACTIVATED_SUCCESSFULLY('Merchant');
      }
      // Prepare response
      res.locals.response = {
        message: responseMessage,
        body: {},
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async updateMerchantDetails(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract updatedMerchantDetails and merchantId from the request
      const { updatedMerchantDetails, merchantId } = dataFromRequest(req);
      let responseMessage = templateConstants.UPDATED_SUCCESSFULLY('Merchant');
      // Check if updatedMerchantDetails.merchantBody is not null or undefined
      if (!isNullOrUndefined(updatedMerchantDetails?.merchantBody)) {
        // Update merchant details
        await this.merchantService.updateMerchantDetails(
          updatedMerchantDetails.merchantBody,
          merchantId
        );
        // Refund Booking whose slots lie between merchant closing hours
        const mercahntCloseStartTime =
          updatedMerchantDetails?.merchantBody?.closingStartTime;
        const mercahntCloseEndTime =
          updatedMerchantDetails?.merchantBody?.closingEndTime;
        if (
          !isNullOrUndefined(mercahntCloseStartTime) &&
          !isNullOrUndefined(mercahntCloseEndTime)
        ) {
          const bookings =
            await this.bookingService.checkMerchantBookingWithDate(
              merchantId,
              mercahntCloseStartTime,
              mercahntCloseEndTime
            );

          if (bookings.length > 0) {
            const bookingIds = bookings.map(
              (booking: any) => booking.dataValues.bookingId
            );
            if (bookingIds.length > 0) {
              await this.bookingService.cancelBookingDuringMerchantClosure(
                bookingIds
              );
              // responseMessage = `Successfully refunded ${bookingIds.length} bookings due to the merchant's closure from ${mercahntCloseStartTime} to ${mercahntCloseEndTime}.`;
              responseMessage =
                templateConstants.BOOKING_REFUND_DUE_TO_MERCHANT_CLOSURE(
                  bookingIds.length,
                  mercahntCloseStartTime,
                  mercahntCloseEndTime
                );
            }
          }
        }
      }

      // Check if updatedMerchantDetails.pricingTerms is not null or undefined
      if (!isNullOrUndefined(updatedMerchantDetails?.pricingTerms)) {
        // Update pricing terms
        await this.merchantService.updateMerchantPricingTerms(
          updatedMerchantDetails.pricingTerms,
          merchantId
        );
      }

      // Check if updatedMerchantDetails.additionalServices is not null or undefined
      if (!isNullOrUndefined(updatedMerchantDetails?.additionalServices)) {
        // Update additional services
        await this.merchantService.updateMerchantAdditionServices(
          updatedMerchantDetails.additionalServices,
          merchantId
        );
      }

      // Check if updatedMerchantDetails.machineIds is not null or undefined
      if (!isNullOrUndefined(updatedMerchantDetails?.machineIds)) {
        // Handle merchant machines
        await this.machineService.handleMerchantMachines(
          updatedMerchantDetails.machineIds,
          merchantId
        );
      }

      // Check if updatedMerchantDetails.machineAgentArr is not null or undefined
      if (!isNullOrUndefined(updatedMerchantDetails?.machineAgentArr)) {
        // Handle machine agents
        await this.merchantService.handleMachineAgents(
          updatedMerchantDetails.machineAgentArr,
          merchantId
        );
      }

      if (!isNullOrUndefined(updatedMerchantDetails?.images)) {
        await this.merchantService.updateMerchantImages(
          updatedMerchantDetails.images,
          merchantId
        );
      }

      if (!isNullOrUndefined(updatedMerchantDetails?.holidays)) {
        await this.merchantService.updateMerchantHolidays(
          updatedMerchantDetails.holidays,
          merchantId
        );
      }

      // Prepare response object
      res.locals.response = {
        message: responseMessage,
        body: {},
      };
      // Pass control to the next middleware
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMerchantImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, limit, offset } = dataFromRequest(req);
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const body = {
        merchantId,
        _limit,
        _offset,
      };
      const images = await this.merchantService.getMerchantImages(body);
      res.locals.response = {
        message: templateConstants.LIST_OF('Merchant Images'),
        body: {
          data: {
            images: {
              totalCount: images.count,
              images: images.rows,
            },
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // async addMerchantImages(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { images, merchantId } = dataFromRequest(req);

  //     await this.merchantService.addMerchantImages(images, merchantId);
  //     res.locals.response = {
  //       message: templateConstants.CREATED_SUCCESSFULLY('Merchant Images'),
  //       body: {},
  //     };
  //     next();
  //   } catch (err) {
  //     next(err); // Pass error to error handling middleware
  //   }
  // }

  // Method to get details of a merchant
  async getNearByMerchants(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract merchant ID from request
      const {
        latitude,
        longitude,
        distance,
        limit,
        offset,
        date,
        search,
        washTypeIds,
        operationStartTime,
        operationEndTime,
        vehicleType,
      } = dataFromRequest(req);
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const body = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        distance: parseFloat(distance),
        date: isNullOrUndefined(date)
          ? new Date()
          : moment(date).format('YYYY-MM-DD HH:mm:ss'),
        operationStartTime: operationStartTime,
        operationEndTime: operationEndTime,
        limit: _limit,
        offset: _offset,
        search,
        washTypeIds,
        vehicleType,
      };

      // delete  details of the merchant
      const data = await this.merchantService.getNearBYMerchants(body);

      // Prepare response
      res.locals.response = {
        message: '',
        body: {
          data: {
            merchantList: data.merchants,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              data.totalMerchants
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get list of merchant with booking counts
  async getMerchantListWithBookingCounts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract merchant ID from request
      const { limit, offset, search, city, state, region, vehicleType,machineIds } =
        dataFromRequest(req);
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const body = {
        limit: _limit,
        offset: _offset,
        search: !isNullOrUndefined(search) ? search.trim() : null,
        city,
        state,
        region,
        vehicleType,
        machineIds
      };

      // delete  details of the merchant
      const merchants =
        await this.merchantService.getMerchantListWithBookingCounts(body);

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('merchants'),
        body: {
          data: {
            merchantList: merchants.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              merchants.count
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async exportAppointmentAndBookingCollectionReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { search, city, state, region, vehicleType } = dataFromRequest(req);

      const body = {
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        search,
        city,
        state,
        region,
        vehicleType,
      };

      // delete  details of the merchant
      const merchants =
        await this.merchantService.getMerchantListWithBookingCounts(body);

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < merchants?.rows?.length; i++) {
        let data: any = merchants?.rows[i]?.dataValues;
        result.push({
          'Sr.No': i + 1, // Serial number
          Region: data?.city?.state?.region?.name,
          State: data?.city?.state?.name,
          City: data?.city?.name,
          Dealer: data.outletName,
          Machine: data.machines?.length ? data.machines[0].name : '',
          'Total Booking': data.totalBookingCount, // Number of vehicles added by the customer
          'Booking Completed': data.completedCount,
          'Booking Cancelled': data.cancelledCount,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Region',
        'State',
        'City',
        'Dealer',
        'Machine',
        'Total Booking',
        'Booking Completed',
        'Booking Cancelled',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'AppointmentAndBookingCollection.csv';

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
          'Appointment and booking details'
        ), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }

  // Method to get details of a merchant
  async exportMerchantList(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        sortBy,
        orderBy,
        search,
        state,
        city,
        region,
        startDate,
        endDate,
      } = dataFromRequest(req); // Extract pagination and sorting parameters from request

      const queryBody = {
        limit: config.exportFileMaxQueryLimit,
        offset: 0,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc',
        search: !isNullOrUndefined(search) ? search.trim() : search,
        state: state,
        city: city,
        region: region,
        startDate: startDate,
        endDate: endDate,
      };

      const merchants = await this.merchantService.getMerchantList(queryBody);

      let data: any = merchants.rows;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        let machinesName = '';
        if (data[i]?.dataValues?.machines.length) {
          let machines = data[i]?.dataValues?.machines;

          for (let j = 0; j < machines.length; j++) {
            if (j == 0) {
              machinesName = machines[j].dataValues?.name;
            } else {
              machinesName = ',' + machines[j].dataValues?.name;
            }
          }
        }
        result.push({
          'Sr.No': i + 1, // Serial number
          'Service Center ID': `${data[i]?.dataValues?.uniqueId} `,
          'Service Center Name': data[i]?.dataValues?.outletName,
          'Service Center Location': data[i]?.dataValues?.address,
          Machine: machinesName,
          Status: data[i]?.dataValues?.isActive,
          'Created Date': data[i]?.dataValues?.createdAt,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'Service Center ID',
        'Service Center Name',
        'Service Center Location',
        'Machine',
        'Status',
        'Created Date',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'ServiceCenterCollection.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('Service Center'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get details of a merchant city
  async getMerchantCity(req: Request, res: Response, next: NextFunction) {
    try {
      const merchants = await this.merchantService.merchantCityList();

      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Merchants City'),
        body: {
          data: {
            merchantsCiyList: merchants,
            // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create instance of MerchantController
const merchantController = new MerchantController();
export { merchantController };
