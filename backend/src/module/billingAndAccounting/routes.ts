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

    this.billingAndAccountingRouter.get(
      '/getInvoice/:machineMemoId',
      verifyClient.bind(verifyClient),
      billingAndAccountingPolicy.validateGetMemoDetailRequest,
      billingAndAccountingController.getInvoiceAddress
    );

    // only for testing purpose
    this.billingAndAccountingRouter.post(
      '/testPayment/encryption',
      verifyClient.bind(verifyClient),
      billingAndAccountingController.getEncryptData
    );
    this.billingAndAccountingRouter.post(
      '/testPayment/decryption',
      verifyClient.bind(verifyClient),
      billingAndAccountingController.getDecryptData
    );

    // this.billingAndAccountingRouter.post(
    //   '/testPayment/orderStatus/:orderId',
    //   verifyClient.bind(verifyClient),
    //   billingAndAccountingController.getOrderStatus
    // );

    // to get success response
    this.billingAndAccountingRouter.post(
      '/testPayment/successResponse',
      billingAndAccountingController.getSuccessResponse
    );
    this.billingAndAccountingRouter.post(
      '/testPayment/failedResponse',
      billingAndAccountingController.getFailedResponse
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
