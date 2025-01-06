import { subscriptionController } from './controllers/subscription.controller';

import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import {
  addSubscriptionDTO,
  buySubscriptionDTO,
  updateSubscriptionDTO,
} from './dto/subscription.dto';
import { validate } from 'express-validation';
import { validateSubscription } from './policy/subscription.policy';
class SubscriptionRoutes {
  private subscriptionController: typeof subscriptionController;

  constructor(private subscriptionRouter: any) {
    this.subscriptionRouter = subscriptionRouter;
    this.subscriptionController = subscriptionController;
    this.subscriptionRoutes();
  }

  private subscriptionRoutes() {
    this.subscriptionRouter.post(
      '/subscription',
      validate(addSubscriptionDTO, {}, {}),
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateSubscription.validateNewSubscription.bind(validateSubscription),
      this.subscriptionController.addSubscription.bind(
        this.subscriptionController
      ) /// Route handler to create subscription details
    );
    this.subscriptionRouter.get(
      '/subscription',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.subscriptionController.getSubscriptionList.bind(
        this.subscriptionController
      ) /// Route handler to get subscription details
    );

    this.subscriptionRouter.get(
      '/subscription/:subscriptionId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateSubscription.validateSubscriptionId.bind(validateSubscription),
      this.subscriptionController.getSubscriptionDetail.bind(
        this.subscriptionController
      ) /// Route handler to get subscription details
    );

    this.subscriptionRouter.delete(
      '/subscription/:subscriptionId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateSubscription.validateSubscriptionId.bind(validateSubscription),
      this.subscriptionController.deleteSubscriptions.bind(
        this.subscriptionController
      ) /// Route handler to delete subscription details
    );

    this.subscriptionRouter.put(
      '/subscription/:subscriptionId',
      validate(updateSubscriptionDTO, {}, {}),
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateSubscription.validateSubscriptionId.bind(validateSubscription),
      this.subscriptionController.updateSubscriptionsDetail.bind(
        this.subscriptionController
      ) /// Route handler to delete subscription details
    );

    this.subscriptionRouter.get(
      '/subscription/available/activeSubscriptionList',
      authCustomerGuard.bind(authCustomerGuard), // Middleware to verify client
      this.subscriptionController.getSubscriptionList.bind(
        this.subscriptionController
      ) /// Route handler to delete subscription details
    );

    this.subscriptionRouter.get(
      '/subscription/subscribedCustomers/:subscriptionId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateSubscription.validateSubscriptionId.bind(validateSubscription),
      this.subscriptionController.getSubscribedCustomerList.bind(
        this.subscriptionController
      ) /// Route handler to delete subscription details
    );

    this.subscriptionRouter.post(
      '/subscription/buy',
      validate(buySubscriptionDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard), //
      validateSubscription.validateEligibilityBuySubscriptionRequest.bind(
        validateSubscription
      ),
      validateSubscription.validateBuySubscriptionRequest.bind(
        validateSubscription
      ),
      this.subscriptionController.buySubscription.bind(
        this.subscriptionController
      ) /// Route handler to get subscription buy
    );
    // API to get  merchant list
    this.subscriptionRouter.get(
      '/subscriptionList/csv',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.subscriptionController.exportSubscriptionList.bind(
        this.subscriptionController
      ) // Route handler to add merchant
    );

    this.subscriptionRouter.get(
      '/subscription/subscribedCustomers/csv/:subscriptionId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.subscriptionController.exportSubscribedUsersList.bind(
        this.subscriptionController
      ) // Route handler to export csv for subscribed users
    );

    this.subscriptionRouter.post(
      '/buy/another/subscription',
      validate(buySubscriptionDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard), //

      validateSubscription.validateBuySubscriptionRequest.bind(
        validateSubscription
      ),
      this.subscriptionController.buySubscription.bind(
        this.subscriptionController
      ) /// Route handler to get subscription buy
    );
  }
}

export const subscriptionRoutes = (subscriptionRouter: any) => {
  return new SubscriptionRoutes(subscriptionRouter);
};
