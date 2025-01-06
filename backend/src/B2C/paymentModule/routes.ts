import { verifyClient,authCustomerGuard } from '../../services/common/requestResponseHandler';
import { paymentController } from './controllers/payment.controller';
import { paymentPolicy } from './policies/payment.policy';

class CustomerPaymentRoutes {
  constructor(private paymentRouter: any) {
    this.paymentRouter = paymentRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.paymentRouter.post(
      '/generate/hash',
      authCustomerGuard.bind(authCustomerGuard),
      paymentPolicy.validateGenerateHashRequest,
      paymentController.generateHash
    );
  }
}
export const customerPaymentRoutes = (paymentRouter: any) => {
  return new CustomerPaymentRoutes(paymentRouter);
};
