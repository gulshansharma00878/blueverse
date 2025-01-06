import {
  TransactionType,
  WalletTransaction,
} from '../../models/wallet_transection';
import { UserWallet } from '../../models/user_wallet';
import { Booking } from '../../models/booking';
import { WashOrder } from '../../models/wash_order';
import { Vehicle } from '../../models/vehicle';
import { WashType } from '../../../models/wash_type';
import { Merchant } from '../../models/merchant';
import { Subscription } from '../../models/subscription';

class WalletServices {
  // Method to add money to a user's wallet
  async addMoneyToWallet(balance: number, customerId: string) {
    try {
      // Incrementing the balance in the user's wallet
      await UserWallet.increment(
        { balance: balance }, // `balance` here is the amount to be added to the existing balance
        {
          where: {
            customerId: customerId, // Condition to match the user by their customerId
          },
        }
      );

      // Getting the user wallet data
      const walletData = await this.getUserWallet(customerId);

      // Making the transaction History
      await WalletTransaction.create({
        walletId: walletData.walletId,
        amount: balance,
        type: TransactionType.CREDIT,
      });

      // returning the value
      return walletData;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to retrieve the user's wallet information
  async getUserWallet(customerId: string) {
    try {
      // Finding one user wallet record based on customerId
      let walletData: any = await UserWallet.findOne({
        where: {
          customerId: customerId, // Condition to match the user by their customerId
        },
      });

      if (!walletData) {
        // Creating the user Wallet
        walletData = await UserWallet.create({
          customerId: customerId,
        });
      }

      return walletData;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to get transactions related to a specific wallet
  async getTransaction(customerId: string) {
    try {
      // Getting the user wallet data
      const walletData = await this.getUserWallet(customerId);

      // Finding all transactions related to the walletId
      const transactionData = await WalletTransaction.findAll({
        where: {
          walletId: walletData.walletId, // Condition to match the transactions by walletId
        },
        include: [
          {
            model: Booking,
            attributes: {
              exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
            },
            include: [
              {
                model: WashOrder,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
                },
                include: [
                  {
                    model: Vehicle,
                    attributes: {
                      exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
                    },
                  },
                  {
                    model: WashType,
                    attributes: {
                      exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
                    },
                  },
                ],
              },
              {
                model: Merchant,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
                },
              },
            ],
          },
          {
            model: Subscription,
            attributes: {
              exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
            },
          }
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
        },
        order: [['createdAt', 'DESC']],
      });

      return {
        walletData: walletData,
        transactionData: transactionData,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const WalletService = new WalletServices();
export { WalletService };
