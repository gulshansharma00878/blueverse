import { validate } from 'express-validation';

import { _validate } from '../../helpers/validate';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { machineWalletController } from './controllers/machineWallet.controller';

class MachineWalletRoutes {
  constructor(private machineWalletRouter: any) {
    this.machineWalletRouter = machineWalletRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.machineWalletRouter.post(
      '/dealer/transactionHistory',
      verifyClient.bind(verifyClient),
      machineWalletController.getDealerTransactionHistory
    ),
      this.machineWalletRouter.post(
        '/dealer/exportTransactionHistory',
        verifyClient.bind(verifyClient),
        machineWalletController.exportDealerTransactionHistory
      ),
      this.machineWalletRouter.post(
        '/dealer/machineAllbalance',
        verifyClient.bind(verifyClient),
        machineWalletController.getDealerAllMachinebalance
      );
  }
}
const machineWalletRoutes = (machineWalletRouter: any) => {
  return new MachineWalletRoutes(machineWalletRouter);
};

export = {
  MachineWalletRoutes: MachineWalletRoutes,
  machineWalletRoutes: machineWalletRoutes,
};
