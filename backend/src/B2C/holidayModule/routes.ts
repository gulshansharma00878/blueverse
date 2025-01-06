import { validate } from 'express-validation';
import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { holidayController } from './controller/holiday.controller';
import { addNewHoliday } from './dto/holiday.dto';
import { validateHoliday } from './policy/holiday.policy';

/**
 * HolidayRoutes Class
 *
 * This class is responsible for defining and registering routes related to badge operations in the application.
 * It encapsulates the route definitions and associates each route with appropriate middlewares and controller methods.
 */
class HolidayRoutes {
  // Declaring holidayController as a private property of type holidayController
  private holidayController: typeof holidayController;

  /**
   * Constructor
   *
   * @param {any} holidayRouter - The router object from Express used to define routes.
   *
   * Initializes the holidayRouter and holidayController properties and registers all routes by calling the registerRoutes method.
   */
  constructor(private holidayRouter: any) {
    // Initialize the holidayRouter and holidayController
    this.holidayRouter = holidayRouter;
    this.holidayController = holidayController;
    this.registerRoutes(); // Call method to register routes
  }

  private registerRoutes() {
    this.holidayRouter.post(
      '/holiday',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(addNewHoliday, {}, {}), // Middleware to validate request body against addNewBadgeDto schema
      validateHoliday.validateNewHoliday.bind(validateHoliday),
      this.holidayController.addNewHoliday.bind(this.holidayController) // Controller method to handle the creation of a new badge
    );

    this.holidayRouter.get(
      '/holiday',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.holidayController.getHolidayList.bind(this.holidayController) // Controller method to handle the creation of a new badge
    );

    this.holidayRouter.get(
      '/holiday/:holidayId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateHoliday.validateHolidayId.bind(validateHoliday),
      this.holidayController.getHolidayDetails.bind(this.holidayController) // Controller method to handle the creation of a new badge
    );

    this.holidayRouter.put(
      '/holiday/:holidayId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(addNewHoliday, {}, {}),
      validateHoliday.validateHolidayId.bind(validateHoliday),
      this.holidayController.updateHolidayDetails.bind(this.holidayController) // Controller method to handle the creation of a new badge
    );

    this.holidayRouter.delete(
      '/holiday/:holidayId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateHoliday.validateHolidayId.bind(validateHoliday),
      this.holidayController.deleteHolidayDetails.bind(this.holidayController) // Controller method to handle the creation of a new badge
    );
  }
}

// Exporting a function to create and return an instance of HolidayRoutes with the provided holidayRouter
export const holidayRoutes = (holidayRouter: any) => {
  return new HolidayRoutes(holidayRouter);
};
