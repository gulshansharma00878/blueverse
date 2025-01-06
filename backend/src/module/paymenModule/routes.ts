import { verifyClient } from '../../services/common/requestResponseHandler';
import { paymentController } from './controllers/payment.controller';
import { paymentPolicy } from './policies/payment.policy';

class PaymentRoutes {
  constructor(private paymentRouter: any) {
    this.paymentRouter = paymentRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.paymentRouter.post(
      '/generate/hash',
      verifyClient.bind(verifyClient),
      paymentPolicy.validateGenerateHashRequest,
      paymentController.generateHash
    );
    this.paymentRouter.get(
      '/status',
      verifyClient.bind(verifyClient),
      paymentController.getPaymentStatus
    );
    this.paymentRouter.post(
      '/webhook/complete',
      paymentController.callbackWebhookComplete
    );
    this.paymentRouter.get(
      '/machineMemoDetail/:machineId',
      paymentController.getLastAdvanceMemoDetail
    );
  }
}
const paymentRoutes = (paymentRouter: any) => {
  return new PaymentRoutes(paymentRouter);
};

export = {
  PaymentRoutes: PaymentRoutes,
  paymentRoutes: paymentRoutes,
};
