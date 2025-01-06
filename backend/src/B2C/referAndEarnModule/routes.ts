import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { createReferAndEarDTO } from './dto/referAndEarn.dto';
import { validate } from 'express-validation';
import { validateReferAndEarn } from './policies/referAndEarn.policy';
import { referAndEarnController } from './controllers/referAndEarn.controller';
class ReferAndEarnRoutes {
  private referAndEarnController: typeof referAndEarnController;

  constructor(private referAndEarnRouter: any) {
    this.referAndEarnRouter = referAndEarnRouter;
    this.referAndEarnController = referAndEarnController;
    this.referAndEarnRoutes();
  }

  private referAndEarnRoutes() {
    this.referAndEarnRouter.post(
      '/referAndEarn',
      validate(createReferAndEarDTO, {}, {}),
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateReferAndEarn.validateNewReferAndEarn.bind(validateReferAndEarn),
      validateReferAndEarn.validateReferAndEarnDates.bind(validateReferAndEarn),
      this.referAndEarnController.createReferAndEarn.bind(
        this.referAndEarnController
      ) /// Route handler to create refer and earn details
    );
    this.referAndEarnRouter.get(
      '/referAndEarn/:referAndEarnId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.getReferAndEarnById.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.delete(
      '/referAndEarn/:referAndEarnId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateReferAndEarn.validateReferAndEarnId.bind(validateReferAndEarn),
      this.referAndEarnController.deleteReferAndEarn.bind(
        this.referAndEarnController
      ) /// Route handler to delete refer and earn details
    );

    this.referAndEarnRouter.put(
      '/referAndEarn/:referAndEarnId',
      validate(createReferAndEarDTO, {}, {}),
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateReferAndEarn.validateReferAndEarnId.bind(validateReferAndEarn),
      validateReferAndEarn.validateReferAndEarnDates.bind(validateReferAndEarn),
      this.referAndEarnController.updateReferAndEarn.bind(
        this.referAndEarnController
      ) /// Route handler to delete refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referrerUserList/:referAndEarnId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.getReferrerList.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referredUserList/:customerId/:referAndEarnId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.getReferredUserList.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referredUserForCustomer/:customerId',
      authCustomerGuard.bind(authCustomerGuard), // Middleware to verify client
      this.referAndEarnController.getReferredUserListForCustomer.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referrerUser/csv',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.exportReferrerCollectionReport.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referredUser/csv/:customerId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.exportReferredCollectionReport.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referrerSettingList',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.getAllReferAndEarn.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referrerSettingList/csv',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.exportReferredAndEarnSettingCollectionReport.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referrerSettingList/count',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.countReferredAndEarnSetting.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/referrerUserList/count/:referAndEarnId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.referAndEarnController.countReferrerReferral.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );

    this.referAndEarnRouter.get(
      '/current/referAndEarn',
      authCustomerGuard.bind(authCustomerGuard), // Middleware to verify client
      this.referAndEarnController.getCurrentReferAndEarn.bind(
        this.referAndEarnController
      ) /// Route handler to get refer and earn details
    );
  }
}

export const referAndEarnRoutes = (referAndEarnRouter: any) => {
  return new ReferAndEarnRoutes(referAndEarnRouter);
};
