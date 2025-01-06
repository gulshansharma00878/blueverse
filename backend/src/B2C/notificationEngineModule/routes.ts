import { validate } from 'express-validation';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { notificationEngineController } from './controller/notificationEngine.controller';
import {} from './dto/notificationEngine.dto';
import { validateNotificationEngine } from './policy/notificationEngine.policy';
import { newNotificationEngine } from './dto/notificationEngine.dto';
/**
 * NotificationEngineRoutes Class
 *
 * This class is responsible for defining and registering routes related to notification engine operations in the application.
 * It encapsulates the route definitions and associates each route with appropriate middlewares and controller methods.
 */
class NotificationEngineRoutes {
  // Declaring notificationEngineController as a private property of type notificationEngineController
  private notificationEngineController: typeof notificationEngineController;

  // Constructor receives the notificationEngineRouter and initializes routes
  constructor(private notificationEngineRouter: any) {
    this.notificationEngineRouter = notificationEngineRouter;
    this.notificationEngineController = notificationEngineController;
    this.registerRoutes(); // Call method to register routes
  }

  // Method to register routes and associate them with middleware and controller methods
  private registerRoutes() {
    // Route to add a new notification engine
    this.notificationEngineRouter.post(
      '/notificationEngine',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateNotificationEngine.validateNewNotificationEngine.bind(
        validateNotificationEngine // Middleware to validate notification engine ID
      ),
      this.notificationEngineController.addNewNotificationEngine.bind(
        this.notificationEngineController // Controller method to add a new notification engine
      )
    );

    // Route to get the list of notification engines
    this.notificationEngineRouter.get(
      '/notificationEngine',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.notificationEngineController.getNotificationEngineList.bind(
        this.notificationEngineController // Controller method to get the list of notification engines
      )
    );

    // Route to get the list of notification engines
    this.notificationEngineRouter.get(
      '/notificationEngine/export/csv',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.notificationEngineController.getNotificationEngineExport.bind(
        this.notificationEngineController // Controller method to get the list of notification engines
      )
    );

    // Route to get details of a specific notification engine by ID
    this.notificationEngineRouter.get(
      '/notificationEngine/:notificationEngineId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateNotificationEngine.validateNotificationEngineId.bind(
        validateNotificationEngine // Middleware to validate notification engine ID
      ),
      this.notificationEngineController.getNotificationEngineDetails.bind(
        this.notificationEngineController // Controller method to get details of a specific notification engine
      )
    );

    // Route to update details of a specific notification engine by ID
    this.notificationEngineRouter.put(
      '/notificationEngine/:notificationEngineId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateNotificationEngine.validateNotificationEngineId.bind(
        validateNotificationEngine // Middleware to validate notification engine ID
      ),
      this.notificationEngineController.updateNotificationEngineDetails.bind(
        this.notificationEngineController // Controller method to update details of a specific notification engine
      )
    );

    // Route to update details of a specific notification engine by ID
    this.notificationEngineRouter.post(
      '/notificationEngine/resendNotification/:notificationEngineId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateNotificationEngine.validateNotificationEngineId.bind(
        validateNotificationEngine // Middleware to validate notification engine ID
      ),
      this.notificationEngineController.resendNotifications.bind(
        this.notificationEngineController // Controller method to update details of a specific notification engine
      )
    );
    // Route to delete a specific notification engine by ID
    this.notificationEngineRouter.delete(
      '/notificationEngine/:notificationEngineId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateNotificationEngine.validateNotificationEngineId.bind(
        validateNotificationEngine // Middleware to validate notification engine ID
      ),
      this.notificationEngineController.deleteNotificationEngine.bind(
        this.notificationEngineController // Controller method to delete a specific notification engine
      )
    );
  }
}

// Exporting a function to create and return an instance of NotificationEngineRoutes with the provided notificationEngineRouter
export const notificationEngineRoutes = (notificationEngineRouter: any) => {
  return new NotificationEngineRoutes(notificationEngineRouter);
};
