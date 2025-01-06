import stringConstants from '../../../common/stringConstants';
import { BookingService } from '../services/booking.service';
import { CONSTANT } from '../constant';
import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import db from '../../../models/index';
import { Booking, WashBy } from '../../models/booking';
import { WashOrder } from '../../models/wash_order';
import { Slot } from '../../models/slot';
import { CouponService } from '../../couponModule/services/coupon.service';
import { isNullOrUndefined } from '../../../common/utility';
import { templateConstants } from '../../../common/templateConstants';
import { BadgeService } from '../../badgeModule/services/badge.service';
import { config } from '../../../config/config';
import { Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';

export class BookingController {
  private bookingService: typeof BookingService;
  constructor() {
    this.bookingService = BookingService;
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);

      // Destructuring the necessary fields from the extracted data
      let {
        merchantId,
        startDateTime,
        endDateTime,
        washTypeId,
        vehicleId,
        waterSaved,
        washPoints,
        status,
        remarks,
        locked,
        additionalServices,
        slotId,
        loggedInUser,
        skuNumber,
      } = data;

      // Start a new transaction
      const transaction = await db.sequelize.transaction();

      try {
        let slotData;

        if (!slotId) {
          // Creating the slot with the provided merchantId, startDateTime, and endDateTime
          slotData = await this.bookingService.addSlot(
            merchantId,
            startDateTime,
            endDateTime,
            transaction // Pass transaction object
          );
          slotId = slotData.slotId;
        }

        // Creating the wash data with the provided information and the slotId from the created slot
        const washData = await this.bookingService.addWash(
          merchantId,
          washTypeId,
          slotId,
          vehicleId,
          waterSaved,
          washPoints,
          status,
          remarks,
          loggedInUser.userId,
          transaction // Pass transaction object
        );

        // Creating the booking with the slotId, merchantId, washOrderId from the created wash data, and userId from the logged-in user
        const bookingData = await this.bookingService.addBooking(
          slotId,
          merchantId,
          washData.washOrderId,
          loggedInUser.userId,
          locked,
          transaction // Pass transaction object
        );

        if (additionalServices && additionalServices.length) {
          await this.bookingService.addBookingAdditionalServices(
            additionalServices,
            bookingData.bookingId,
            merchantId,
            transaction // Pass transaction object
          );
        }

        // If everything is successful, commit the transaction
        await transaction.commit();

        // Setting the response data to be sent back to the client
        res.locals.response = {
          message: CONSTANT.BOOKING_CREATED_SUCCESSFULLY,
          body: { data: { bookingData: bookingData } },
        };
        next();
      } catch (err) {
        // If any operation fails, rollback the transaction
        await transaction.rollback();
        next(err);
      }
    } catch (err) {
      next(err);
    }
  }
  async getCustomerBookingDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);

      // Destructuring the necessary fields from the extracted data
      const { loggedInUser, status } = data;

      const bookingDetails =
        await this.bookingService.getCustomerBookingDetails(
          loggedInUser.userId,
          status
        );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: CONSTANT.BOOKING_DETAILS,
        body: { data: { bookingDetails: bookingDetails } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async bookingPayment(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);

      const { loggedInUser } = data;

      // Calling the payment booking service
      await this.bookingService.bookingPayment(data);

      if (!isNullOrUndefined(data?.couponId)) {
        await CouponService.updateCouponAvailCount(data.couponId);
      }

      // Calling the payment booking service
      await this.bookingService.referralRedeem(data.loggedInUser.userId);

      // allot badge (Will delete in future)
      BadgeService.allotBadge(loggedInUser.userId);

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: CONSTANT.PAYMENT_SUCCESSFULLY,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);

      // Calling the payment booking service
      const cancelledData = await this.bookingService.cancelBooking(
        data,
        res.locals.request.booking
      );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: CONSTANT.CANCELLED_SUCCESSFULLY,
        body: {
          data: {
            cancelledData: cancelledData,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async rescheduleBooking(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);

      let { slotId, bookingId, merchantId, startDateTime, endDateTime } = data;

      if (!slotId) {
        // Creating the slot with the provided merchantId, startDateTime, and endDateTime
        const slotData = await Slot.create({
          merchantId: merchantId,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        });
        slotId = slotData.slotId;
      }

      // Updating the slot in  booking
      await Booking.update(
        { slotId: slotId },
        {
          where: {
            bookingId: bookingId,
          },
        }
      );

      await WashOrder.update(
        { slotId: slotId },
        {
          where: {
            washOrderId: res.locals.request.booking.washOrderId,
          },
        }
      );

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: CONSTANT.SLOT_RESCHEDULE,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async bookingWashPayment(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);
      const { loggedInUser } = data;

      // Calling the payment booking service
      await this.bookingService.bookingWashPayment(data);

      // allot badge (Will delete in future)
      BadgeService.allotBadge(loggedInUser.userId);

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: CONSTANT.PAYMENT_SUCCESSFULLY,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async bookingWashCounts(req: Request, res: Response, next: NextFunction) {
    try {
      // Calling the payment booking service
      const bookingCount = await this.bookingService.getBookingWashCounts();

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.DETAIL('Booking counts'),
        body: {
          data: {
            bookingCount: bookingCount,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async b2cLedger(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const data = dataFromRequest(req);

      // Calling the payment booking service
      const completedBooking = await this.bookingService.b2cLedger(data);

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.LIST_OF('completed booking'),
        body: {
          data: completedBooking,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async bookingMemo(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request
      const { bookingId } = dataFromRequest(req);

      // Calling the service
      const bookingMemo = await this.bookingService.bookingMemo(bookingId);

      // Setting the response data to be sent back to the client
      res.locals.response = {
        message: templateConstants.LIST_OF('Booking Memo'),
        body: {
          data: bookingMemo?.s3Address,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportb2cLedger(req: any, res: any, next: any) {
    try {
      const requestData = dataFromRequest(req);
      requestData.limit = config.exportFileMaxQueryLimit;
      requestData.offset = 0;

      const { customer } = await this.bookingService.b2cLedger(requestData);
      let data: any = customer;

      let result: any = [];
      let csvFields: any = [];

      // Iterate over the customer data to format it for CSV export
      for (let i = 0; i < data.length; i++) {
        let source: any;

        if (data[i].washBy == WashBy.Subscription) {
          if (data[i].paymentAmount > 0) {
            source = 'Wallet/Wash';
          } else {
            source = 'Wash';
          }
        } else {
          source = 'Wallet';
        }

        result.push({
          SKU: data[i].SkuNumber, // Serial number
          'CUSTOMER ID': data[i]?.washOrder?.vehicle?.customer?.uniqueId,
          'Customer Name': `${data[i]?.washOrder?.vehicle?.customer?.firstName} ${data[i]?.washOrder?.vehicle?.customer?.lastName}`,
          HSRP: data[i]?.washOrder?.vehicle?.hsrpNumber,
          'Service Center': data[i]?.merchant?.outletName,
          State: data[i]?.washOrder?.vehicle?.customer?.state,
          City: data[i]?.washOrder?.vehicle?.customer?.city,
          'Vehicle Type': data[i]?.washOrder?.vehicle?.vehicleType,
          'Wash Type': data[i]?.washOrder?.washType?.Name,
          'Add on amount': data[i].dataValues.addOnAmount,
          Source: source,
          'Previous Wallet Balance':
            data[i]?.washWalletBalance?.previousBalance.wallet.amount,
          'Previous Wash Balance': `${data[i]?.washWalletBalance?.previousBalance.washWallet.silver} Silver | ${data[i]?.washWalletBalance?.previousBalance.washWallet.gold} Gold | ${data[i]?.washWalletBalance?.previousBalance.washWallet.silver} Platinum `,
          'Available Wallet Balance':
            data[i]?.washWalletBalance?.currentBalance.wallet.amount,
          'Available Wash Balance': `${data[i]?.washWalletBalance?.currentBalance.washWallet.silver} Silver | ${data[i]?.washWalletBalance?.currentBalance.washWallet.gold} Gold | ${data[i]?.washWalletBalance?.currentBalance.washWallet.silver} Platinum `,
          'Wash Date': data[i]?.bookingTime,
        });
      }

      // Define the fields/columns for the CSV file
      csvFields = [
        'SKU',
        'CUSTOMER ID',
        'Customer Name',
        'HSRP',
        'Service Center',
        'State',
        'City',
        'Vehicle Type',
        'Wash Type',
        'Add on amount',
        'Source',
        'Previous Wallet Balance',
        'Previous Wash Balance',
        'Available Wallet Balance',
        'Available Wash Balance',
        'Wash Date',
      ];

      // Create a new CSV parser instance with the specified fields
      const csvParser = new Parser({ fields: csvFields });

      // Convert the result array into CSV format
      const csvData = csvParser.parse(result);

      // Define the name of the CSV file
      const fileName = 'B2cLedger.csv';

      // Upload the CSV file and get the location where it is stored
      let uploadLoc = await upload.uploadFile(csvData, fileName);

      // Set the response object with the upload location and success message
      res.locals.response = {
        body: {
          data: {
            uploadLoc: uploadLoc, // URL or location of the uploaded CSV file
          },
        },
        message: templateConstants.EXPORT_FILE_MESSAGE('B2c Ledger'), // Success message
      };

      // Call the next middleware or function
      next();
    } catch (err) {
      next(err);
    }
  }
}

const bookingController = new BookingController();
export { bookingController };
