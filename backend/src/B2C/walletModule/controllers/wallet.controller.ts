import { WalletService } from '../services/wallet.service';
import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';

export class WalletController {
  private walletService: typeof WalletService;
  constructor() {
    this.walletService = WalletService;
  }

  // Asynchronous method to handle adding money to a user's wallet
  async addMoneyToWallet(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const data = dataFromRequest(req);

      const { balance, loggedInUser } = data; // Destructuring balance and loggedInUser from extracted data

      // Calling the service method to add money to the wallet
      await this.walletService.addMoneyToWallet(balance, loggedInUser.userId);

      // Setting a success response message
      res.locals.response = {
        message: CONSTANT.MONEY_ADDED_SUCCESSFULLY,
      };
      // Calling next middleware function
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWallet(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const data = dataFromRequest(req);

      const { loggedInUser } = data; // Destructuring balance and loggedInUser from extracted data

      const walletData = await this.walletService.getUserWallet(
        loggedInUser.userId
      );

      // Setting a success response message
      res.locals.response = {
        message: CONSTANT.WALLET_FETCHED,
        body: {
          walletData: walletData,
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getWalletTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const data = dataFromRequest(req);

      const { loggedInUser } = data; // Destructuring balance and loggedInUser from extracted data

      const walletData = await this.walletService.getTransaction(
        loggedInUser.userId
      );

      // Setting a success response message
      res.locals.response = {
        message: CONSTANT.TRANSACTION_FETCHED,
        body: {
          data: {
            walletData: walletData,
          },
        },
      };

      next();
    } catch (err) {
      next(err);
    }
  }
}

const walletController = new WalletController();
export { walletController };
