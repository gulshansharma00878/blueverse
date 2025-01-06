import { WashWalletService } from '../services/wallet.service';
import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';

export class WashWalletController {
  private washWalletService: typeof WashWalletService;
  constructor() {
    this.washWalletService = WashWalletService;
  }

  // Asynchronous method to handle adding money to a user's wallet
  async addWashToWallet(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const data = dataFromRequest(req);

      const { noOfWash, loggedInUser } = data; // Destructuring balance and loggedInUser from extracted data

      // Calling the service method to add money to the wallet
      await this.washWalletService.addWashToWallet(
        noOfWash,
        loggedInUser.userId
      );

      // Setting a success response message
      res.locals.response = {
        message: CONSTANT.WASH_ADDED_SUCCESSFULLY,
      };
      // Calling next middleware function
      next();
    } catch (err) {
     next(err);
    }
  }

  async getWashWallet(req: Request, res: Response, next: NextFunction) {
    try {
      // Extracting data from the request using a utility function
      const data = dataFromRequest(req);

      const { loggedInUser } = data; // Destructuring balance and loggedInUser from extracted data

      const walletData = await this.washWalletService.getUserWashWallet(
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

      const walletData = await this.washWalletService.getWashTransaction(
        loggedInUser.userId
      );

      // Setting a success response message
      res.locals.response = {
        message: CONSTANT.TRANSACTION_FETCHED,
        body: {
          data:{
            walletData:walletData
          }
        },
      };

      next();
    } catch (err) {
     next(err);
    }
  }
}

const washWalletController = new WashWalletController();
export { washWalletController };
