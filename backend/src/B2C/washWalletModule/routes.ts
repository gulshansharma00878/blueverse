import { washWalletController } from './controllers/wallet.controller';

import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { addWashDTO } from './dto/wallet.dto';
import { validate } from 'express-validation';
import { validateWalletApis } from './policies/wallet.policy';

class WashWalletRoutes {
  private washWalletController: typeof washWalletController;

  constructor(private washWalletRouter: any) {
    this.washWalletRouter = washWalletRouter;
    this.washWalletController = washWalletController;
    this.walletRoutes();
  }

  private walletRoutes() {
    this.washWalletRouter.post(
      '/washWallet',
      validate(addWashDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      this.washWalletController.addWashToWallet.bind(this.washWalletController)
    );
    this.washWalletRouter.get(
      '/washWallet',
      authCustomerGuard.bind(authCustomerGuard),
      this.washWalletController.getWashWallet.bind(this.washWalletController)
    );

    this.washWalletRouter.get(
      '/washWallet/transaction',
      authCustomerGuard.bind(authCustomerGuard),
      this.washWalletController.getWalletTransaction.bind(this.washWalletController)
    );
  }
}

export const washWalletRoutes = (washWalletRouter: any) => {
  return new WashWalletRoutes(washWalletRouter);
};
