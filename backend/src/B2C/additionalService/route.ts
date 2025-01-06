import { additionalSeriveController } from './controllers/additionalService.controller';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { validateAdditionalService } from './policies/additionalService.policy';
import {
  additionalSeriveAddDTO,
  additionalSeriveUpdateDTO,
  additionalSeriveStatusUpdateDTO,
} from './dto/additionalService.dto';
import { validate } from 'express-validation';

// Class to define the routes for additional services
class AdditionalServiceRoutes {
  // Variable to hold the controller instance
  private additionalSeriveController: typeof additionalSeriveController;

  // Constructor to initialize the router and register routes
  constructor(private additionalServiceRouter: any) {
    this.additionalServiceRouter = additionalServiceRouter;
    this.additionalSeriveController = additionalSeriveController;
    this.registerRoutes();
  }

  // Method to register all the routes for additional services
  private registerRoutes() {
    // API to add additional service name
    this.additionalServiceRouter.post(
      '/additionalService',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validate(additionalSeriveAddDTO, {}, {}), // Middleware to validate the request body
      validateAdditionalService.validateAdditionalServiceName.bind(
        validateAdditionalService
      ), // Custom validation middleware for service name
      this.additionalSeriveController.addAdditonalService.bind(
        this.additionalSeriveController
      ) // Controller method to handle the request
    );

    // API to get list of additional service names
    this.additionalServiceRouter.get(
      '/additionalService',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      this.additionalSeriveController.getAdditionalServiceList.bind(
        this.additionalSeriveController
      ) // Controller method to handle the request
    );

    // API to get additional service name details
    this.additionalServiceRouter.get(
      '/additionalService/:additionalServiceId',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validateAdditionalService.validateAdditionalServiceNameId.bind(
        validateAdditionalService
      ), // Custom validation middleware for service ID
      this.additionalSeriveController.getAdditionalServiceDetail.bind(
        this.additionalSeriveController
      ) // Controller method to handle the request
    );

    // API to update additional service name details
    this.additionalServiceRouter.put(
      '/additionalService/:additionalServiceId',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validate(additionalSeriveUpdateDTO, {}, {}), // Middleware to validate the request body
      validateAdditionalService.validateAdditionalServiceNameId.bind(
        validateAdditionalService
      ), // Custom validation middleware for service ID
      validateAdditionalService.validateUpdateAdditionalServiceName.bind(
        validateAdditionalService
      ), // Custom validation middleware for updating service name
      this.additionalSeriveController.updateAdditionalServiceDetail.bind(
        this.additionalSeriveController
      ) // Controller method to handle the request
    );

    // API to delete additional service name details
    this.additionalServiceRouter.delete(
      '/additionalService/:additionalServiceId',
      verifyClient.bind(verifyClient), // Middleware to verify the client
      validateAdditionalService.validateAdditionalServiceNameId.bind(
        validateAdditionalService
      ), // Custom validation middleware for service ID
      validateAdditionalService.validateDeleteAdditionalService.bind(
        validateAdditionalService
      ),
      this.additionalSeriveController.deleteAdditionalService.bind(
        this.additionalSeriveController
      ) // Controller method to handle the request
    );
  }
}

// Function to create an instance of AdditionalServiceRoutes with the provided router
export const additionalServiceRoutes = (additionalServiceRouter: any) => {
  return new AdditionalServiceRoutes(additionalServiceRouter);
};
