import { Op } from 'sequelize';
import { NextFunction, Request, Response } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import createHttpError from 'http-errors';
import { CONSTANT } from '../constant';
import { Slot } from '../../../B2C/models/slot';
import { Booking, Status } from '../../../B2C/models/booking';
import { UserWallet } from '../../models/user_wallet';
import { WashOrder } from '../../models/wash_order';
import { UserWashWallet } from '../../models/user_wash_wallet';
import { WashTypeConstant } from '../../models/wash_wallet_transaction';
import { Vehicle, VehicleType } from '../../models/vehicle';
import { CustomerSubscription } from '../../models/customer_subscription';
import db from '../../../models/index';
import { BookingAdditionalService } from '../../models/booking_additional_service';

class ValidateBookingApis {
  async validateCreateBookingRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract data from the request
      const data = dataFromRequest(req);

      const {
        startDateTime,
        endDateTime,
        merchantId,
        vehicleId,
        loggedInUser,
      } = data;

      // Try to find slot information based on the provided start date, end date, and merchant ID
      const slotData = await Slot.findOne({
        where: {
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          merchantId: merchantId,
        },
      });

      if (slotData) {
        // User cannot Book same slot for same vehicle
        let bookingDetailsWhichIsNotPaid = await Booking.findOne({
          where: {
            paymentStatus: Status.Pending,
            customerId: loggedInUser.userId,
          },

          include: [
            {
              model: Slot,
              where: {
                slotId: slotData.slotId,
              },
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
          ],
        });

        if (bookingDetailsWhichIsNotPaid) {
          // Start a transaction to ensure atomicity
          await db.sequelize.transaction(async (t: any) => {
            // Delete additional services
            await BookingAdditionalService.destroy({
              where: { bookingId: bookingDetailsWhichIsNotPaid.bookingId },
              transaction: t,
            });

            // Find wash order associated with the booking
            const washOrder = await WashOrder.findByPk(
              bookingDetailsWhichIsNotPaid.washOrderId,
              {
                transaction: t,
              }
            );

            // Delete the booking
            await Booking.destroy({
              where: { bookingId: bookingDetailsWhichIsNotPaid.bookingId },
              transaction: t,
            });

            // Delete the wash order
            if (washOrder) {
              await WashOrder.destroy({
                where: { washOrderId: washOrder.washOrderId },
                transaction: t,
              });
            }
          });
        }

        // If slot information is found, try to find how many bookings are in this slot
        const bookingData = await Booking.findAll({
          where: {
            slotId: slotData.slotId,
            bookingStatus: {
              [Op.notIn]: [Status.Cancelled, Status.Completed],
            },
          },
        });

        // User cannot Book same slot for same vehicle
        let bookingDetails = await Booking.findOne({
          where: {
            bookingStatus: {
              [Op.notIn]: [Status.Cancelled, Status.Completed],
            },
          },
          include: [
            {
              model: Slot,
              where: {
                slotId: slotData.slotId,
              },
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
            {
              model: WashOrder,
              where: {
                vehicleId: vehicleId,
              },
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
          ],
        });

        if (bookingDetails) {
          throw createHttpError(400, CONSTANT.CAN_NOT_BOOKED);
        }

        // If there are already 2 bookings for this slot, throw a slot full error
        if (bookingData.length == 2) {
          throw createHttpError(400, CONSTANT.SLOT_FULL);
        } else {
          // If the slot is not fully booked, set the slot ID in the request body
          req.body.slotId = slotData.slotId;
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateBookingPaymentRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract data from the request
      const data = dataFromRequest(req);

      // Destructure the payment amount and logged-in user information from the extracted data
      const { paymentAmount, loggedInUser } = data;

      // Find the wallet data for the logged-in user based on their customer ID
      const walletData = await UserWallet.findOne({
        where: {
          customerId: loggedInUser.userId, // Condition to match the user by their customer ID
        },
      });

      if (paymentAmount && paymentAmount > 0) {
        // Check if the wallet balance is less than the payment amount
        if (walletData.balance < paymentAmount) {
          // If the balance is insufficient, throw an error with status 400 and a predefined message
          throw createHttpError(400, CONSTANT.INSUFFICIENT_BALANCE);
        }
      }

      // If the balance is sufficient, proceed to the next middleware or route handler
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateBookingId(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract data from the request
      const data = dataFromRequest(req);

      // Destructure the payment amount and logged-in user information from the extracted data
      const { bookingId, loggedInUser } = data;

      // Fetch booking details to get the createdAt time and amount
      const booking = await Booking.findOne({
        where: { bookingId: bookingId, customerId: loggedInUser.userId },
        include: [
          {
            model: WashOrder,
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
            include: [
              {
                model: Vehicle,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
            ],
          },
        ],
      });
      if (!booking) {
        throw createHttpError(400, CONSTANT.INVALID_BOOKING);
      }

      if (booking.bookingStatus == Status.Cancelled) {
        throw createHttpError(400, CONSTANT.BOOKING_CANCELLED_ALREADY);
      }

      res.locals.request = {
        booking: booking,
      };

      // If the balance is sufficient, proceed to the next middleware or route handler
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateBookingWashPaymentRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract data from the request
      const data = dataFromRequest(req);

      // Destructure washType, loggedInUser, and vehicleType from the extracted data
      const { washType, loggedInUser, vehicleType } = data;

      // Find wallet data for the logged-in user based on their customer ID
      const walletData: any = await UserWashWallet.findOne({
        where: {
          customerId: loggedInUser.userId, // Match the user by customer ID
        },
      });

      // Check if freeWash is greater than 0
      if (walletData.freeWash > 0) {
        // Allow the request to proceed as the payment is handled with freeWash
        return next();
      }

      // Define wash type mapping to associate vehicle types and balance checks
      const washTypeMapping: any = {
        [WashTypeConstant.GOLD]: {
          [VehicleType.TWO_WHEELER]: {
            balanceField: 'goldWash', // Field for two-wheeler Gold wash balance
            error: CONSTANT.INSUFFICIENT_GOLD_BALANCE, // Error message for insufficient Gold balance
          },
          [VehicleType.FOUR_WHEELER]: {
            balanceField: 'goldWashFourWheeler', // Field for four-wheeler Gold wash balance
            error: CONSTANT.INSUFFICIENT_GOLD_BALANCE, // Error message for insufficient Gold balance
          },
        },
        [WashTypeConstant.PLATINUM]: {
          [VehicleType.TWO_WHEELER]: {
            balanceField: 'platinumWash', // Field for two-wheeler Platinum wash balance
            error: CONSTANT.INSUFFICIENT_PLATINUM_BALANCE, // Error message for insufficient Platinum balance
          },
          [VehicleType.FOUR_WHEELER]: {
            balanceField: 'platinumWashFourWheeler', // Field for four-wheeler Platinum wash balance
            error: CONSTANT.INSUFFICIENT_GOLD_BALANCE, // Error message for insufficient Platinum balance
          },
        },
        [WashTypeConstant.SILVER]: {
          [VehicleType.TWO_WHEELER]: {
            balanceField: 'silverWash', // Field for two-wheeler Silver wash balance
            error: CONSTANT.INSUFFICIENT_SILVER_BALANCE, // Error message for insufficient Silver balance
          },
          [VehicleType.FOUR_WHEELER]: {
            balanceField: 'silverWashFourWheeler', // Field for four-wheeler Silver wash balance
            error: CONSTANT.INSUFFICIENT_GOLD_BALANCE, // Error message for insufficient Silver balance
          },
        },
      };

      // Retrieve the balance information based on washType and vehicleType
      const selectedWashType = washTypeMapping[washType];

      if (selectedWashType) {
        const balanceField = selectedWashType[vehicleType].balanceField;

        // Check if the user's wallet has sufficient balance for the selected wash type and vehicle type
        if (walletData[balanceField] < 1) {
          // If the balance is insufficient, throw an error with status 400 and a predefined message
          throw createHttpError(400, selectedWashType[vehicleType].error);
        }
      } else {
        // Throw an error if the washType is invalid or not mapped
        throw createHttpError(400, CONSTANT.INVALID_WASH_TYPE);
      }

      // If the balance is sufficient, proceed to the next middleware or route handler
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateSubscriptionDeduction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract data from the request
      const data = dataFromRequest(req);

      // Destructure the payment amount and logged-in user information from the extracted data
      const { loggedInUser, vehicleType, washType } = data;
      console.log('🚀 ~ ValidateBookingApis ~ washType:', washType);
      let whereCondition: any = {};
      // Check wash type and set the appropriate balance condition
      if (washType === WashTypeConstant.GOLD) {
        whereCondition['remainingGoldWash'] = {
          [Op.gte]: 1,
        };
      } else if (washType === WashTypeConstant.PLATINUM) {
        whereCondition['remainingPlatinumWash'] = {
          [Op.gte]: 1,
        };
      } else {
        whereCondition['remainingSilverWash'] = {
          [Op.gte]: 1,
        };
      }

      // Query the CustomerSubscription to fetch the user's active subscription
      const customerSubscription = await CustomerSubscription.findAll({
        where: {
          customerId: loggedInUser.userId, // Match the user by their customerId
          isExpired: false, // Ensure the subscription is not expired
          vehicleType: vehicleType, // Match the subscription to the vehicle type
          ...whereCondition, // Include the wash type condition
        },
        order: [
          ['expiryDate', 'ASC'], // Sort by expiryDate in ascending order
        ],
      });

      // Check if a valid subscription is found
      if (customerSubscription.length) {
        req.body.customerSubscriptionId =
          customerSubscription[0].dataValues.customerSubscriptionId;
      }

      // If the balance is sufficient, proceed to the next middleware or route handler
      next();
    } catch (err) {
      next(err);
    }
  }
}

const validateBookingApis = new ValidateBookingApis();
export { validateBookingApis };
