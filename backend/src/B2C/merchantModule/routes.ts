import { validate } from 'express-validation';
import {
  verifyClient,
  authCustomerGuard,
} from '../../services/common/requestResponseHandler';
import { merchantController } from './controller/merchant.controller';
import {
  newMerchant,
  merchantStatus,
  updateMerchant,
  merchanImageAdd,
} from './dto/merchant.dto';
import { validateMerchant } from './policy/merchant.policy';

class MerchantRoutes {
  private merchantController: typeof merchantController;

  constructor(private merchantRouter: any) {
    // Initialize the merchantRouter and merchantController
    this.merchantRouter = merchantRouter;
    this.merchantController = merchantController;
    this.registerRoutes(); // Call method to register routes
  }

  private registerRoutes() {
    // API to add new merchant
    this.merchantRouter.post(
      '/merchant',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(newMerchant, {}, {}), // Validate request body against schema
      validateMerchant.validateNewMerchant.bind(validateMerchant), // Validate merchant data
      this.merchantController.addMerchant.bind(this.merchantController) // Route handler to add merchant
    );

    // API to get  merchant list
    this.merchantRouter.get(
      '/merchant',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.merchantController.getMerchantList.bind(this.merchantController) // Route handler to add merchant
    );

    // API to get merchant details by ID
    this.merchantRouter.get(
      '/merchant/:merchantId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateMerchant.validateMerchantId.bind(validateMerchant), // Validate merchant ID
      this.merchantController.getMerchantDetails.bind(this.merchantController) // Route handler to get merchant details
    );

    // API for customer to get merchant details by ID
    this.merchantRouter.get(
      '/merchant/customer/:merchantId',
      authCustomerGuard.bind(authCustomerGuard), // Middleware to verify client
      validateMerchant.validateMerchantId.bind(validateMerchant), // Validate merchant ID
      this.merchantController.getMerchantDetails.bind(this.merchantController) // Route handler to get merchant details
    );

    // API to get merchant details by ID
    this.merchantRouter.put(
      '/merchant/:merchantId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(updateMerchant, {}, {}), // Validate request body against schema
      validateMerchant.validateMerchantId.bind(validateMerchant), // Validate merchant ID
      validateMerchant.validateMerchantUpdate.bind(validateMerchant),
      this.merchantController.updateMerchantDetails.bind(
        this.merchantController
      ) // Route handler to get merchant details
    );
    //
    // API to delete merchant details by ID
    this.merchantRouter.delete(
      '/merchant/:merchantId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateMerchant.validateMerchantId.bind(validateMerchant), // Validate merchant ID
      validateMerchant.validateFutureBooking.bind(validateMerchant),
      this.merchantController.deleteMerchant.bind(this.merchantController) // Route handler to get merchant details
    );

    // API to update merchant status by ID
    this.merchantRouter.put(
      '/merchant/status/:merchantId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(merchantStatus, {}, {}), // Validate request body against schema
      validateMerchant.validateMerchantId.bind(validateMerchant), // Validate merchant ID
      validateMerchant.validateMerchantStatus.bind(validateMerchant), // Val
      this.merchantController.updateMerchantStatus.bind(this.merchantController) // Route handler to get merchant details
    );

    // API to get available machine
    this.merchantRouter.get(
      '/merchant/available/machines',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.merchantController.getAvailableMachines.bind(this.merchantController) // Route handler to get merchant details
    );

    // API to get available agents
    this.merchantRouter.get(
      '/merchant/available/agents',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.merchantController.getAvailableAgents.bind(this.merchantController) // Route handler to get merchant details
    );

    // API to get merchant  images
    this.merchantRouter.get(
      '/merchant/images/list',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.merchantController.getMerchantImages.bind(this.merchantController) // Route handler to get merchant details
    );
    // API to get list of nearby merchants
    this.merchantRouter.get(
      '/merchant/nearby/list',
      authCustomerGuard.bind(authCustomerGuard),
      this.merchantController.getNearByMerchants.bind(this.merchantController)
    );

    // API to get list of  merchants with booking counts
    this.merchantRouter.get(
      '/merchant/booking/counts',
      verifyClient.bind(verifyClient),
      this.merchantController.getMerchantListWithBookingCounts.bind(
        this.merchantController
      )
    );

    this.merchantRouter.get(
      '/merchant/booking/count/csv',
      verifyClient.bind(verifyClient),
      this.merchantController.exportAppointmentAndBookingCollectionReport.bind(
        this.merchantController
      )
    );
    // API to get  merchant list
    this.merchantRouter.get(
      '/merchantList/csv',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.merchantController.exportMerchantList.bind(this.merchantController) // Route handler to add merchant
    );

    // API to get  merchant list
    this.merchantRouter.get(
      '/merchantCity',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.merchantController.getMerchantCity.bind(this.merchantController) // Route handler to add merchant
    );
  }
}

// Export function to create merchant routes
export const merchantRoutes = (merchantRouter: any) => {
  return new MerchantRoutes(merchantRouter);
};
