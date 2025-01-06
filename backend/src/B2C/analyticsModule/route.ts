import { analyticsController } from './controllers/analytics.controller';

import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';

class AnalyticsRoutes {
  private analyticsController: typeof analyticsController;

  constructor(private analyticsRouter: any) {
    this.analyticsRouter = analyticsRouter;
    this.analyticsController = analyticsController;
    this.analyticsRoutes();
  }

  /**
   * Defines the routes for analytics-related endpoints.
   */
  private analyticsRoutes() {
    // Route to get booking counts
    this.analyticsRouter.get(
      '/analytics/admin/bookingCount',
     verifyClient.bind(verifyClient),
      this.analyticsController.bookingCustomerCounts.bind(
        this.analyticsController
      )
    );

    // Route to get vehicle type booking counts
    this.analyticsRouter.get(
      '/analytics/admin/vehicleType',
      verifyClient.bind(verifyClient),
      this.analyticsController.vehicleTypeBookingCounts.bind(
        this.analyticsController
      )
    );

    // Route to get subscription counts
    this.analyticsRouter.get(
      '/analytics/admin/subscription',
      verifyClient.bind(verifyClient),
      this.analyticsController.subscriptionCounts.bind(this.analyticsController)
    );

    // Route to get additional service counts
    this.analyticsRouter.get(
      '/analytics/admin/additional-service',
      verifyClient.bind(verifyClient),
      this.analyticsController.additionalServiceCounts.bind(
        this.analyticsController
      )
    );

    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/service-center',
      verifyClient.bind(verifyClient),
      this.analyticsController.serviceCenterLocationCounts.bind(
        this.analyticsController
      )
    );

    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/customer-booking-list',
      verifyClient.bind(verifyClient),
      this.analyticsController.customerBookingList.bind(
        this.analyticsController
      )
    );

    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/additional-service-details/:basId',
      verifyClient.bind(verifyClient),
      this.analyticsController.additionalServiceDetails.bind(
        this.analyticsController
      )
    );
    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/csv/customer-booking-list',
      verifyClient.bind(verifyClient),
      this.analyticsController.exportCustomerBookingList.bind(
        this.analyticsController
      )
    );

    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/vehicle-count-with-wash',
      verifyClient.bind(verifyClient),
      this.analyticsController.totalVehicleCountAndWashType.bind(
        this.analyticsController
      )
    );

    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/additional-service-details/csv/:basId',
      verifyClient.bind(verifyClient),
      this.analyticsController.exportCustomerAdditionalList.bind(
        this.analyticsController
      )
    );

    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/app-downloads',
      verifyClient.bind(verifyClient),
      this.analyticsController.totalAppDownloads.bind(this.analyticsController)
    );

    // Route to get service center location counts
    this.analyticsRouter.get(
      '/analytics/admin/app-downloads/csv',
      verifyClient.bind(verifyClient),
      this.analyticsController.exportTotalAppDownloads.bind(
        this.analyticsController
      )
    );
  }
}

export const analyticsRoutes = (analyticsRouter: any) => {
  return new AnalyticsRoutes(analyticsRouter);
};
