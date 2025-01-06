import {
  TransactionType,
  WalletTransaction,
} from '../../models/wallet_transection';
import { Booking } from '../../models/booking';
import { WashOrder } from '../../models/wash_order';
import { Vehicle } from '../../models/vehicle';
import { WashType } from '../../../models/wash_type';
import { Merchant } from '../../models/merchant';
import { UserWashWallet } from '../../models/user_wash_wallet';
import { WashWalletTransaction } from '../../models/wash_wallet_transaction';

class WashWalletServices {
  // Method to add money to a user's wallet
  async addWashToWallet(noOfWASH: number, customerId: string) {
    try {
      // // Incrementing the balance in the user's wallet
      // await UserWashWallet.increment(
      //   { noOfWASH: noOfWASH }, // `balance` here is the amount to be added to the existing balance
      //   {
      //     where: {
      //       customerId: customerId, // Condition to match the user by their customerId
      //     },
      //   }
      // );
      // // Getting the user wallet data
      // const washWalletData = await this.getUserWashWallet(customerId);
      // // Making the transaction History
      // await WashWalletTransaction.create({
      //   washWalletId: washWalletData.washWalletId,
      //   washBalance: noOfWASH,
      //   type: TransactionType.CREDIT,
      //   transactionType: TransactionType.SUBSCRIPTION,
      // });
      // returning the value
      //return washWalletData;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to retrieve the user's wallet information
  async getUserWashWallet(customerId: string) {
    try {
      // Finding one user wallet record based on customerId
      let walletData: any = await UserWashWallet.findOne({
        where: {
          customerId: customerId, // Condition to match the user by their customerId
        },
      });

      if (!walletData) {
        // Creating the user Wallet
        walletData = await UserWashWallet.create({
          customerId: customerId,
        });
      }

      return walletData;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Method to get transactions related to a specific wallet
  async getWashTransaction(customerId: string) {
    try {
      // Getting the user wallet data
      const washWalletData = await this.getUserWashWallet(customerId);

      // Finding all transactions related to the walletId
      const transactionData = await WashWalletTransaction.findAll({
        where: {
          washWalletId: washWalletData.washWalletId, // Condition to match the transactions by walletId
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
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt'], // Excluding creation and update timestamps
        },
        order: [['createdAt', 'DESC']],
      });

      return {
        washWalletData: washWalletData,
        washTransactionData: transactionData,
      };
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

const WashWalletService = new WashWalletServices();
export { WashWalletService };
