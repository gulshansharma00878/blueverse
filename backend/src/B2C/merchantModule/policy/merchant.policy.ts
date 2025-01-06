import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { MerchantService } from '../services/merchant.service';
import { BookingService } from '../../bookingModule/services/booking.service';
import { AdditonalSeriveService } from '../../additionalService/services/additionalService.service';
import { CONSTANT } from '../constant';
import moment from 'moment-timezone'; // Import moment library for date/time manipulation
import { machineService } from '../../../module/machineModule/services/machine.service';

// Class for validating merchant-related requests
class ValidateMerchant {
  private merchantService: typeof MerchantService;
  private additionalService: typeof AdditonalSeriveService;
  private machineService: typeof machineService;
  private bookingService: typeof BookingService;
  constructor() {
    // Initialize services
    this.merchantService = MerchantService;
    this.additionalService = AdditonalSeriveService;
    this.machineService = machineService;
    this.bookingService = BookingService;
  }

  // Method to validate if the merchant name already exists when adding a new merchant
  async validateNewMerchant(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const {
        outletName,
        pricingTerms,
        additionalServices,
        machineAgents,
        operationStartTime,
        operationEndTime,
        runningStartTime,
        runningEndTime,
        closingStartTime,
        closingEndTime,
        vehicleType,
      } = dataFromRequest(req);

      // Check if the merchant name already exists
      const isNameExist = await this.merchantService.getMerchantByName(
        outletName,
        vehicleType
      );
      if (isNameExist) {
        // Throw an error if the merchant name already exists
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST(
            `A merchant with the name ${outletName}`
          )
        );
      }
      // if (
      //   !isNullOrUndefined(runningStartTime) &&
      //   !isNullOrUndefined(runningEndTime)
      // ) {
      //   if (moment(runningEndTime) < moment(runningStartTime)) {
      //     throw createHttpError(400, CONSTANT.RUNNING_TIME_ERROR);
      //   }
      // }
      // if (
      //   !isNullOrUndefined(operationStartTime) &&
      //   !isNullOrUndefined(operationEndTime)
      // ) {
      //   if (moment(operationEndTime) < moment(operationStartTime)) {
      //     throw createHttpError(400, CONSTANT.OPERATION_TIME_ERROR);
      //   }
      // }
      if (
        !isNullOrUndefined(closingStartTime) &&
        !isNullOrUndefined(closingEndTime)
      ) {
        if (moment(closingEndTime) < moment(closingStartTime)) {
          throw createHttpError(400, CONSTANT.CLOSING_TIME_ERROR);
        }
        // req.body.closingStartTime = moment(closingStartTime)
        //   .tz('Asia/Kolkata')
        //   .format('MM/DD/YYYY hh:mm:ss');
        // req.body.closingEndTime = moment(closingEndTime)
        //   .tz('Asia/Kolkata')
        //   .format('MM/DD/YYYY hh:mm:ss');
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to validate merchant ID
  async validateMerchantId(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract merchant ID from request body
      const { merchantId } = dataFromRequest(req);
      // Check if the merchant ID is a valid GUID
      if (!isValidGuid(merchantId)) {
        // Throw an error if the merchant ID is not valid
        throw createHttpError(400, templateConstants.INVALID('merchantId'));
      }
      const merchant = await this.merchantService.isMerchantExist(merchantId);
      if (isNullOrUndefined(merchant)) {
        throw createHttpError(
          400,
          templateConstants.DOES_NOT_EXIST('merchant')
        );
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to validate merchant ID
  async validateMerchantUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract merchant ID from request body
      const { merchantId } = dataFromRequest(req);
      // Check if the merchant ID is a valid GUID
      if (!isValidGuid(merchantId)) {
        // Throw an error if the merchant ID is not valid
        throw createHttpError(400, templateConstants.INVALID('merchantId'));
      }
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
      const updatedMerchantDetails: any = {};
      const updateMerchantObj: any = {};
      if (!isNullOrUndefined(bannerImageUrl)) {
        updateMerchantObj.bannerImageUrl = bannerImageUrl;
      }
      if (!isNullOrUndefined(outletName)) {
        updateMerchantObj.outletName = outletName;
      }
      if (!isNullOrUndefined(address)) {
        updateMerchantObj.address = address;
      }
      if (!isNullOrUndefined(latitude) && !isNullOrUndefined(longitude)) {
        updateMerchantObj.latitude = latitude;
        updateMerchantObj.longitude = longitude;
      }
      if (
        !isNullOrUndefined(operationStartTime) &&
        !isNullOrUndefined(operationEndTime)
      ) {
        // if (moment(operationEndTime) < moment(operationStartTime)) {
        //   throw createHttpError(400, CONSTANT.OPERATION_TIME_ERROR);
        // }
        updateMerchantObj.operationStartTime = operationStartTime;
        updateMerchantObj.operationEndTime = operationEndTime;
      }
      if (
        !isNullOrUndefined(runningStartTime) &&
        !isNullOrUndefined(runningEndTime)
      ) {
        // if (moment(runningEndTime) < moment(runningStartTime)) {
        //   throw createHttpError(400, CONSTANT.RUNNING_TIME_ERROR);
        // }
        updateMerchantObj.runningStartTime = runningStartTime;
        updateMerchantObj.runningEndTime = runningEndTime;
      }
      if (
        !isNullOrUndefined(closingStartTime) &&
        !isNullOrUndefined(closingEndTime)
      ) {
        if (moment(closingEndTime) < moment(closingStartTime)) {
          throw createHttpError(400, CONSTANT.CLOSING_TIME_ERROR);
        }
        // const startDate = moment(closingStartTime)
        //   .tz('Asia/Kolkata')
        //   .format('MM/DD/YYYY hh:mm:ss');
        // const endDate = moment(closingEndTime)
        //   .tz('Asia/Kolkata')
        //   .format('MM/DD/YYYY hh:mm:ss');
        // req.body.closingStartTime = startDate;
        // req.body.closingEndTime = endDate;

        // const booking = await this.bookingService.checkMerchantBookingWithDate(
        //   merchantId,
        //   closingStartTime,
        //   closingEndTime
        // );
        // const bookingIds=
        // // if (booking) {
        // //   throw createHttpError(
        // //     400,
        // //     'Some future bookings are available during this closing time.'
        // //   );
        // // }
      }
      updateMerchantObj.closingStartTime = closingStartTime;

      updateMerchantObj.closingEndTime = closingEndTime;
      updateMerchantObj.vehicleType = vehicleType;
      updateMerchantObj.cityId = cityId;
      updatedMerchantDetails['merchantBody'] = updateMerchantObj;
      if (!isNullOrUndefined(machineAgents)) {
        const machineIds = machineAgents.map(
          (machineAgent: any) => machineAgent.machineId
        );
        machineIds.forEach(async (machineId: any) => {
          const machineAssigned =
            await this.machineService.machineAssignedToAnotherMerchant(
              machineId,
              merchantId
            );
          if (machineAssigned) {
            throw createHttpError(400, CONSTANT.MACHINE_NOT_AVAILABLE);
          }
        });
        updatedMerchantDetails['machineIds'] = machineIds;
        const machineAgentArr: any = [];
        machineAgents.forEach((machineAgent: any) => {
          machineAgent.agentIds.forEach((agent: any) => {
            machineAgentArr.push({
              machineId: machineAgent.machineId,
              agentId: agent,
            });
          });
        });
        updatedMerchantDetails['machineAgentArr'] = machineAgentArr;
      }

      if (!isNullOrUndefined(pricingTerms)) {
        updatedMerchantDetails['pricingTerms'] = pricingTerms;
      }
      if (!isNullOrUndefined(additionalServices)) {
        updatedMerchantDetails['additionalServices'] = additionalServices;
      }
      if (!isNullOrUndefined(images)) {
        updatedMerchantDetails['images'] = images;
      }
      if (!isNullOrUndefined(holidays)) {
        updatedMerchantDetails['holidays'] = holidays;
      }
      req.body['updatedMerchantDetails'] = updatedMerchantDetails;
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateFutureBooking(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract merchant ID from request body
      const { merchantId } = dataFromRequest(req);
      const currentDateTime = moment()
        .tz('Asia/Kolkata')
        .format('MM/DD/YYYY hh:mm:ss');
      const bookings = await this.bookingService.futureMerchantBookings(
        merchantId,
        currentDateTime
      );
      if (bookings) {
        throw createHttpError(
          400,
          'Future bookings are availabe for this merchant'
        );
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateMerchantStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract merchant ID from request body
      const { merchantId, isActive } = dataFromRequest(req);
      if (isActive == false) {
        const currentDateTime = moment()
          .tz('Asia/Kolkata')
          .format('MM/DD/YYYY hh:mm:ss');
        const bookings = await this.bookingService.futureMerchantBookings(
          merchantId,
          currentDateTime
        );
        if (bookings) {
          throw createHttpError(
            400,
            'Future bookings are availabe for this merchant'
          );
        }
        // next();
      }

      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create an instance of the validation class and export it
const validateMerchant = new ValidateMerchant();
export { validateMerchant };
