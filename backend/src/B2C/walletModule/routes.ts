import { walletController } from './controllers/wallet.controller';

import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { addMoneyDTO } from './dto/wallet.dto';
import { validate } from 'express-validation';
import { validateWalletApis } from './policies/wallet.policy';

class WalletRoutes {
  private walletController: typeof walletController;

  constructor(private walletRouter: any) {
    this.walletRouter = walletRouter;
    this.walletController = walletController;
    this.walletRoutes();
  }

  private walletRoutes() {
    this.walletRouter.post(
      '/wallet',
      validate(addMoneyDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      this.walletController.addMoneyToWallet.bind(this.walletController)
    );
    this.walletRouter.get(
      '/wallet',
      authCustomerGuard.bind(authCustomerGuard),
      this.walletController.getWallet.bind(this.walletController)
    );

    this.walletRouter.get(
      '/wallet/transaction',
      authCustomerGuard.bind(authCustomerGuard),
      this.walletController.getWalletTransaction.bind(this.walletController)
    );
  }
}

export const walletRoutes = (walletRouter: any) => {
  return new WalletRoutes(walletRouter);
};
