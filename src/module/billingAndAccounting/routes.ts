import { verifyClient } from '../../services/common/requestResponseHandler';
import { billingAndAccountingController } from './controllers/billingAndAccounting.controller';
import { billingAndAccountingPolicy } from './policies/billingAndAccounting.policy';

class BillingAndAccountingRoutes {
  constructor(private billingAndAccountingRouter: any) {
    this.billingAndAccountingRouter = billingAndAccountingRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.billingAndAccountingRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      billingAndAccountingController.getBillingAndAccountingList
    );
    this.billingAndAccountingRouter.get(
      '/detail/:machineMemoId',
      verifyClient.bind(verifyClient),
      billingAndAccountingPolicy.validateGetMemoDetailRequest,
      billingAndAccountingController.getBillingAndAccountingDetail
    );

    this.billingAndAccountingRouter.get(
      '/admin/advanceMemoAmounts',
      verifyClient.bind(verifyClient),
      billingAndAccountingController.getAmountDetails
    );

    this.billingAndAccountingRouter.get(
      '/admin/exportAdvanceMemo',
      verifyClient.bind(verifyClient),
      billingAndAccountingController.exportAdminAdvanceMemo
    );

    this.billingAndAccountingRouter.get(
      '/dealer/exportAdvanceMemo',
      verifyClient.bind(verifyClient),
      billingAndAccountingController.exportDealerAdvanceMemo
    );
  }
}
const billingAndAccountingRoutes = (billingAndAccountingRouter: any) => {
  return new BillingAndAccountingRoutes(billingAndAccountingRouter);
};

export = {
  BillingAndAccountingRoutes: BillingAndAccountingRoutes,
  billingAndAccountingRoutes: billingAndAccountingRoutes,
};
