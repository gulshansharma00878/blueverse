import { validate } from 'express-validation';
import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { badgeController } from './controller/badge.controller';
import { addNewBadgeDto, updateBadge } from './dto/badge.dto';
import { validateBadge } from './policy/badge.policy';

/**
 * BadgeRoutes Class
 *
 * This class is responsible for defining and registering routes related to badge operations in the application.
 * It encapsulates the route definitions and associates each route with appropriate middlewares and controller methods.
 */
class BadgeRoutes {
  // Declaring badgeController as a private property of type badgeController
  private badgeController: typeof badgeController;

  /**
   * Constructor
   *
   * @param {any} badgeRouter - The router object from Express used to define routes.
   *
   * Initializes the badgeRouter and badgeController properties and registers all routes by calling the registerRoutes method.
   */
  constructor(private badgeRouter: any) {
    // Initialize the badgeRouter and badgeController
    this.badgeRouter = badgeRouter;
    this.badgeController = badgeController;
    this.registerRoutes(); // Call method to register routes
  }

  /**
   * registerRoutes Method
   *
   * This method defines all routes related to badges and associates them with middlewares and controller methods.
   * It ensures that each route performs client verification, request validation, and calls the appropriate controller method.
   */
  private registerRoutes() {
    // Route to add a new badge
    this.badgeRouter.post(
      '/badge',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(addNewBadgeDto, {}, {}), // Middleware to validate request body against addNewBadgeDto schema
      validateBadge.validateNewBadge.bind(validateBadge), // Middleware to perform additional badge-specific validations
      this.badgeController.addNewBadge.bind(this.badgeController) // Controller method to handle the creation of a new badge
    );

    // Route to get the list of badges
    this.badgeRouter.get(
      '/badge',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.badgeController.getBadgeList.bind(this.badgeController) // Controller method to retrieve the list of badges
    );

    // Route to get details of a specific badge by ID
    this.badgeRouter.get(
      '/badge/:badgeId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateBadge.validateBadgeId.bind(validateBadge), // Middleware to validate badgeId parameter
      this.badgeController.getBadgeDetails.bind(this.badgeController) // Controller method to retrieve details of a specific badge
    );

    // Route to update details of a specific badge by ID
    this.badgeRouter.put(
      '/badge/:badgeId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(updateBadge, {}, {}), // Middleware to validate request body against updateBadge schema
      validateBadge.validateBadgeId.bind(validateBadge), // Middleware to validate badgeId parameter
      this.badgeController.updateBadgeDetails.bind(this.badgeController) // Controller method to handle the update of a specific badge
    );

    // Route to delete a specific badge by ID
    this.badgeRouter.delete(
      '/badge/:badgeId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateBadge.validateBadgeId.bind(validateBadge), // Middleware to validate badgeId parameter
      this.badgeController.deleteBadge.bind(this.badgeController) // Controller method to handle the deletion of a specific badge
    );

    // customer assigned badge list
    this.badgeRouter.get(
      '/badge/assignedCustomer/:badgeId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateBadge.validateBadgeId.bind(validateBadge), // Middleware to validate badgeId parameter
      this.badgeController.getAssignedBadgeCustomerList.bind(
        this.badgeController
      ) // Controller method to handle the deletion of a specific badge
    );

    // customer assigned badge list
    this.badgeRouter.get(
      '/badge/customer/assignedBadges',
      authCustomerGuard.bind(authCustomerGuard),
      this.badgeController.getCustomerAssigendBadges.bind(this.badgeController)
    );
  }
}

// Exporting a function to create and return an instance of BadgeRoutes with the provided badgeRouter
export const badgeRoutes = (badgeRouter: any) => {
  return new BadgeRoutes(badgeRouter);
};
