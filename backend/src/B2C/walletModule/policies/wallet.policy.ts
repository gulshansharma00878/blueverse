import { NextFunction, Request, Response } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import createHttpError from 'http-errors';
import { CONSTANT } from '../constant';
import { UserWallet } from '../../models/user_wallet';

class ValidateWalletApis {
  async validateGetTransactionRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract data from the request using a custom function
      const data = dataFromRequest(req);

      // Destructure the loggedInUser and walletId from the extracted data
      const { loggedInUser, walletId } = data;

      // Find the wallet data in the UserWallet table where walletId matches
      // and the wallet belongs to the logged-in user (customerId matches loggedInUser.userId)
      const walletData = await UserWallet.findOne({
        where: {
          walletId: walletId,
          customerId: loggedInUser.userId,
        },
      });

      // If no wallet data is found, throw a 400 Bad Request error indicating
      // the wallet does not belong to the logged-in user
      if (!walletData) {
        throw createHttpError(400, CONSTANT.WALLET_NOT_OWNED);
      }

      // If everything is fine, proceed to the next middleware or route handler
      next();
    } catch (err) {
      // Pass any caught errors to the next error-handling middleware
      next(err);
    }
  }
}

const validateWalletApis = new ValidateWalletApis();
export { validateWalletApis };
