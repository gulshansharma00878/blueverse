import { Op, Sequelize, WhereOptions } from 'sequelize';
import { Subscription } from '../../models/subscription';
import { isNullOrUndefined } from '../../../common/utility';
import { UserWashWallet } from '../../models/user_wash_wallet';
import { WashWalletService } from '../../washWalletModule/services/wallet.service';
import { WashWalletTransaction } from '../../models/wash_wallet_transaction';
import {
  TransactionType,
  WalletTransaction,
} from '../../models/wallet_transection';
import { WashTypeConstant } from '../../models/wash_wallet_transaction';
import { UserWallet } from '../../models/user_wallet';
import { WalletService } from '../../walletModule/services/wallet.service';
import { CustomerSubscription } from '../../models/customer_subscription';
import moment from 'moment';
import { Customer } from '../../models/customer';
import { VehicleType } from '../../models/vehicle';

class SubscriptionServices {
  // Method to add money to a user's wallet
  async addSubscription(body: any) {
    try {
      return await Subscription.create(body);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async subscriptionNameExist(name: string) {
    try {
      const whereCondition: WhereOptions = {
        subscriptionName: {
          [Op.iLike]: `%${name.toLowerCase()}%`,  // Case-insensitive match for PostgreSQL
      },
        deletedAt: null,
      };
      return await Subscription.findOne({
        where: whereCondition,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async subscriptionIdExist(subscriptionId: string) {
    try {
      const whereCondition: WhereOptions = {
        subscriptionId: subscriptionId,
        deletedAt: null,
      };
      return await Subscription.findOne({
        where: whereCondition,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  // // Method to add money to a user's wallet
  async getSubscriptionList(queryBody: any) {
    try {
      let {
        limit,
        offset,
        sortBy,
        orderBy,
        search,
        isActive,
        showSubscribedCustomerCount,
        startDate,
        endDate,
        vehicleType,
      } = queryBody;
      let sortOrder: any = [[sortBy, orderBy]]; // Sort order for the query
      const whereCondition: WhereOptions = {
        deletedAt: null,
      };

      if (!isNullOrUndefined(vehicleType)) {
        const vehicleTypeArr = vehicleType.split(',').filter(Boolean); // Removes empty strings
        if (vehicleTypeArr.length > 0) {
          whereCondition['vehicleType'] = {
            [Op.in]: vehicleTypeArr,
          };
        }
      }

      if (startDate && endDate) {
        startDate = moment(startDate).startOf('day').toISOString(); // Start of the day

        endDate = moment(endDate).endOf('day').toISOString();

        whereCondition['createdAt'] = {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        };
      }
      const attributes: any = [
        'subscriptionId',
        'subscriptionName',
        'subscriptionDescription',
        'price',
        'silverWashOffered',
        'goldWashOffered',
        'platinumWashOffered',
        'silverServiceOffered',
        'goldServiceOffered',
        'platinumServiceOffered',
        'subscriptionDays',
        'subscriptionCreatedOn',
        'isActive',
        'createdAt',
        'vehicleType',
      ];

      if (!isNullOrUndefined(search)) {
        whereCondition['subscriptionName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`,
        };
      }
      if (!isNullOrUndefined(isActive)) {
        whereCondition['isActive'] = isActive;
      }
      // if showSubscribedCustomerCount is true,then we have to count all the subscribed customer for particular subscription
      if (
        !isNullOrUndefined(showSubscribedCustomerCount) &&
        showSubscribedCustomerCount == true
      ) {
        attributes.push([
          Sequelize.literal(
            `(SELECT COUNT(*) FROM "customer_subscription" WHERE "customer_subscription"."subscription_id" = "Subscription"."subscription_id" )`
          ),
          'subscribedCustomerCount',
        ]);
      }
      return await Subscription.findAndCountAll({
        attributes: attributes,
        where: whereCondition,
        order: sortOrder, // Apply sorting
        limit: limit, // Limit the number of results
        offset: offset, // Offset for pagination
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getSubscribedCustomerList(queryBody: any, subscriptionId: string) {
    try {
      let { limit, offset, sortBy, orderBy, search, startDate, endDate } =
        queryBody;
      let sortOrder: any = [[sortBy, orderBy]]; // Sort order for the query
      const whereCondition: WhereOptions = {
        // deletedAt: null,
        subscriptionId: subscriptionId,
      };
      if (!isNullOrUndefined(search)) {
        whereCondition['subscriptionName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`,
        };
      }
      // if (!isNullOrUndefined(isActive)) {
      //   whereCondition['isActive'] = isActive;
      // }
      if (startDate && endDate) {
        startDate = moment(startDate)
          .tz('Asia/Kolkata')
          .startOf('day')
          .toISOString();

        endDate = moment(endDate).tz('Asia/Kolkata').endOf('day').toISOString();

        whereCondition['createdAt'] = {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        };
      }
      return await CustomerSubscription.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Customer,
            attributes: [
              'customerId',
              'firstName',
              'lastName',
              'countryCode',
              'phone',
            ],
          },
        ],
        order: sortOrder, // Apply sorting
        limit: limit, // Limit the number of results
        offset: offset, // Offset for pagination
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // // Method to add money to a user's wallet
  async buySubscription(subscriptionId: string, customerId: string) {
    try {
      // Finding the subscription details
      const subscriptionData = await Subscription.findOne({
        where: {
          subscriptionId: subscriptionId,
        },
      });

      if (subscriptionData.vehicleType == VehicleType.TWO_WHEELER) {
        // Adding the subscription data in user wash wallet
        await UserWashWallet.increment(
          {
            silverWash: subscriptionData.silverWashOffered,
            goldWash: subscriptionData.goldWashOffered,
            platinumWash: subscriptionData.platinumWashOffered,
          },
          {
            where: {
              customerId: customerId,
            },
          }
        );
      } else {
        // Adding the subscription data in user wash wallet
        await UserWashWallet.increment(
          {
            silverWashFourWheeler: subscriptionData.silverWashOffered,
            goldWashFourWheeler: subscriptionData.goldWashOffered,
            platinumWashFourWheeler: subscriptionData.platinumWashOffered,
          },
          {
            where: {
              customerId: customerId,
            },
          }
        );
      }

      // Adding in customer subscription
      await CustomerSubscription.create({
        subscriptionName: subscriptionData.subscriptionName,
        subscriptionId: subscriptionData.subscriptionId,
        customerId: customerId,
        price: subscriptionData.price,
        silverWash: subscriptionData.silverWashOffered,
        goldWash: subscriptionData.goldWashOffered,
        platinumWash: subscriptionData.platinumWashOffered,
        remainingSilverWash: subscriptionData.silverWashOffered,
        remainingGoldWash: subscriptionData.goldWashOffered,
        remainingPlatinumWash: subscriptionData.platinumWashOffered,
        subscriptionDays: subscriptionData.subscriptionDays,
        vehicleType: subscriptionData.vehicleType,
        expiryDate: moment()
          .add(`${subscriptionData.subscriptionDays}`, 'days')
          .toDate(),
      });

      // Update current subsciption in customer table
      await Customer.update(
        {
          subscriptionId: subscriptionData.subscriptionId,
        },
        {
          where: {
            customerId: customerId,
          },
        }
      );

      // Creating the User wallet transaction
      // Decrementing the balance in the user's wallet
      await UserWallet.decrement(
        { balance: subscriptionData.price }, // `balance` here is the amount to be added to the existing balance
        {
          where: {
            customerId: customerId, // Condition to match the user by their customerId
          },
        }
      );

      // Getting the user wallet data
      const walletData = await WalletService.getUserWallet(customerId);

      // Making the transaction history
      await WalletTransaction.create({
        walletId: walletData.walletId,
        amount: subscriptionData.price,
        type: TransactionType.DEBIT,
        transactionType: TransactionType.SUBSCRIPTION,
        subscriptionId: subscriptionData.subscriptionId,
      });

      const washWalletData = await WashWalletService.getUserWashWallet(
        customerId
      );

      // Adding the transaction
      if (subscriptionData.silverWashOffered > 0) {
        // Making the transaction History
        await WashWalletTransaction.create({
          washWalletId: washWalletData.washWalletId,
          washBalance: subscriptionData.silverWashOffered,
          type: TransactionType.CREDIT,
          transactionType: TransactionType.SUBSCRIPTION,
          washType: WashTypeConstant.SILVER,
          vehicleType: subscriptionData.vehicleType,
        });
      }

      if (subscriptionData.goldWashOffered > 0) {
        // Making the transaction History
        await WashWalletTransaction.create({
          washWalletId: washWalletData.washWalletId,
          washBalance: subscriptionData.goldWashOffered,
          type: TransactionType.CREDIT,
          transactionType: TransactionType.SUBSCRIPTION,
          washType: WashTypeConstant.GOLD,
          vehicleType: subscriptionData.vehicleType,
        });
      }

      if (subscriptionData.platinumWashOffered > 0) {
        // Making the transaction History
        await WashWalletTransaction.create({
          washWalletId: washWalletData.washWalletId,
          washBalance: subscriptionData.platinumWashOffered,
          type: TransactionType.CREDIT,
          transactionType: TransactionType.SUBSCRIPTION,
          washType: WashTypeConstant.PLATINUM,
          vehicleType: subscriptionData.vehicleType,
        });
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getSubscriptionDetails(subscriptionId: string) {
    try {
      return await Subscription.findOne({
        where: {
          subscriptionId: subscriptionId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async deleteSubscription(subscriptionId: string) {
    try {
      return await Subscription.update(
        {
          deletedAt: new Date(),
        },
        {
          where: {
            subscriptionId: subscriptionId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateSubscriptionDetail(
    subscriptionId: string,
    subscriptionBody: any
  ) {
    try {
      return await Subscription.update(subscriptionBody, {
        where: {
          subscriptionId: subscriptionId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const subscriptionService = new SubscriptionServices();
export { subscriptionService };
