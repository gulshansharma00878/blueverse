import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import moment from 'moment-timezone'; // Import moment library for date/time manipulation
import { subscriptionService } from '../services/subscription.service';
import { CONSTANT } from '../constant';
import { Subscription } from '../../models/subscription';
import { WalletService } from '../../walletModule/services/wallet.service';
import { CustomerSubscription } from '../../models/customer_subscription';
import { Op, Sequelize, WhereOptions } from 'sequelize';
// Class for validating merchant-related requests
class ValidateSubscription {
  private subscriptionService: typeof subscriptionService;
  constructor() {
    // Initialize services
    this.subscriptionService = subscriptionService;
  }

  // Method to validate if the merchant name already exists when adding a new merchant
  async validateNewSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract values from request body
      const {
        subscriptionName,
        subscriptionDescription,
        price,
        silverWashOffered,
        goldWashOffered,
        platinumWashOffered,
        startDate,
        endDate,
      } = dataFromRequest(req);
      const subscription = await this.subscriptionService.subscriptionNameExist(
        subscriptionName
      );
      if (subscription) {
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST(
            `A subscription with the name ${subscriptionName}`
          )
        );
      }
      // req.body.startDate = moment(startDate)
      //   .tz('Asia/Kolkata')
      //   .startOf('day')
      //   .toISOString();

      // req.body.endDate = moment(endDate)
      //   .tz('Asia/Kolkata')
      //   .endOf('day')
      //   .toISOString();

      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateBuySubscriptionRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = dataFromRequest(req);

      // Destruct the data
      const { loggedInUser, subscriptionId } = data;

      let subscriptionData = await Subscription.findOne({
        where: {
          subscriptionId: subscriptionId,
          isActive: true,
        },
      });
      if (!subscriptionData) {
        throw createHttpError(400, CONSTANT.SUBSCRIPTION_INVALID);
      }

      // Getting the user wallet data
      const walletData = await WalletService.getUserWallet(loggedInUser.userId);

      if (subscriptionData.price > walletData.balance) {
        // If the balance is insufficient, throw an error with status 400 and a predefined message
        throw createHttpError(400, CONSTANT.INSUFFICIENT_BALANCE);
      }

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateSubscriptionId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = dataFromRequest(req);

      // Destruct the data
      const { subscriptionId, subscriptionName } = data;

      const subscription = await this.subscriptionService.subscriptionIdExist(
        subscriptionId
      );
      if (isNullOrUndefined(subscription)) {
        throw createHttpError(
          400,
          templateConstants.INVALID('subscription id')
        );
      }

      if (subscriptionName) {
        const whereCondition: any = {
          subscriptionName: {
            [Op.iLike]: `%${subscriptionName.toLowerCase()}%`, // Case-insensitive match for PostgreSQL
          },
          deletedAt: null,
          subscriptionId: {
            [Op.ne]: subscriptionId, // Exclude a specific subscriptionId
          },
        };

        let subsciptionData = await Subscription.findOne({
          where: whereCondition,
        });
        if (subsciptionData) {
          throw createHttpError(
            400,
            templateConstants.ALREADY_EXIST(
              `A subscription with the name ${subscriptionName}`
            )
          );
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateEligibilityBuySubscriptionRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = dataFromRequest(req);

      // Destruct the data
      const { loggedInUser, subscriptionId } = data;

      // Finding the subscription details
      const existingSubscriptionData = await Subscription.findOne({
        where: {
          subscriptionId: subscriptionId,
        },
      });

      let subscriptionData = await CustomerSubscription.findOne({
        where: {
          customerId: loggedInUser.userId,
          isExpired: false,
          vehicleType: existingSubscriptionData.vehicleType,
        },
      });
      if (subscriptionData) {
        if (
          subscriptionData.remainingSilverWash == 0 &&
          subscriptionData.remainingGoldWash == 0 &&
          subscriptionData.remainingPlatinumWash == 0
        ) {
          await CustomerSubscription.update(
            { isExpired: true },
            {
              where: {
                customerId: loggedInUser.userId,
              },
            }
          );
        } else {
          throw createHttpError(400, CONSTANT.RUNNING_SUBSCRIPTION);
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}

// Create an instance of the validation class and export it
const validateSubscription = new ValidateSubscription();
export { validateSubscription };
