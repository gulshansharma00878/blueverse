import { customerController } from './controllers/customer.controller';
import { validateCustomerApis } from './policies/customer.policy';
import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { validate } from 'express-validation';
import { customerUpdate, getCustomer } from './validators/customer.chain';
class CustomerRoutes {
  private customerController: typeof customerController;

  constructor(private customerRouter: any) {
    this.customerRouter = customerRouter;
    this.customerController = customerController;
    this.registerRoutes();
  }

  private registerRoutes() {
    this.customerRouter.put(
      '/customer',
      validate(customerUpdate, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateCustomerApis.validateCustomerPhone.bind(
        validateCustomerApis
      ),
      this.customerController.updateCustomer.bind(this.customerController)
    );

    this.customerRouter.get(
      '/customer',
      validate(getCustomer, {}, {}),
      verifyClient.bind(verifyClient),
      this.customerController.getCustomers.bind(this.customerController)
    );

    this.customerRouter.delete(
      '/customer/:customerId',
      verifyClient.bind(verifyClient),
      this.customerController.deleteCustomer.bind(this.customerController)
    );

    this.customerRouter.put(
      '/customer/:customerId',
      verifyClient.bind(verifyClient),
      validateCustomerApis.validateCustomerActivationRequest.bind(
        validateCustomerApis
      ),
      this.customerController.customerDeactivate.bind(this.customerController)
    );

    this.customerRouter.get(
      '/customer/csv',
      validate(getCustomer, {}, {}),
      verifyClient.bind(verifyClient),
      this.customerController.exportUserCollectionReport.bind(
        this.customerController
      )
    );

    this.customerRouter.get(
      '/customer/state',
      verifyClient.bind(verifyClient),
      this.customerController.getCustomerStateCity.bind(this.customerController)
    );
    this.customerRouter.get(
      '/customer/notification',
      authCustomerGuard.bind(authCustomerGuard),
      this.customerController.getCustomersNotification.bind(
        this.customerController
      )
    );

    this.customerRouter.put(
      '/customer/notification/read',
      authCustomerGuard.bind(authCustomerGuard),
      this.customerController.customerReadNotification.bind(
        this.customerController
      )
    );

    this.customerRouter.get(
      '/customer/cancel/notification',
      authCustomerGuard.bind(authCustomerGuard),
      this.customerController.getCustomerCancelNotification.bind(
        this.customerController
      )
    );

    this.customerRouter.get(
      '/customer/unread/notification',
      authCustomerGuard.bind(authCustomerGuard),
      this.customerController.getCustomersUnreadNotification.bind(
        this.customerController
      )
    );
  }
}

export const customerRoutes = (customerRouter: any) => {
  return new CustomerRoutes(customerRouter);
};
