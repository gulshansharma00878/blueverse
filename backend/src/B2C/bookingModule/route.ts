import { bookingController } from './controllers/booking.controller';
import { validateDto } from '../common/dtoValidator';

import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import {
  BookingPaymentDTO,
  BookingWashPaymentDTO,
  createBookingDTO,
  rescheduleBookingDTO,
} from './dto/booking.dto';
import { validate } from 'express-validation';
import { validateBookingApis } from './policies/booking.policy';

class BookingRoutes {
  private bookingController: typeof bookingController;

  constructor(private bookingRouter: any) {
    this.bookingRouter = bookingRouter;
    this.bookingController = bookingController;
    this.bookingRoutes();
  }

  private bookingRoutes() {
    this.bookingRouter.post(
      '/booking',
      validate(createBookingDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateBookingApis.validateCreateBookingRequest.bind(
        validateBookingApis
      ),
      this.bookingController.createBooking.bind(this.bookingController)
    );
    this.bookingRouter.get(
      '/booking/:status',
      authCustomerGuard.bind(authCustomerGuard),
      this.bookingController.getCustomerBookingDetails.bind(
        this.bookingController
      )
    );

    this.bookingRouter.put(
      '/booking',
      validate(BookingPaymentDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateBookingApis.validateBookingPaymentRequest.bind(
        validateBookingApis
      ),
      this.bookingController.bookingPayment.bind(this.bookingController)
    );

    this.bookingRouter.put(
      '/booking/cancel',
      authCustomerGuard.bind(authCustomerGuard),
      validateBookingApis.validateBookingId.bind(validateBookingApis),
      this.bookingController.cancelBooking.bind(this.bookingController)
    );

    this.bookingRouter.put(
      '/booking/reschedule',
      validate(rescheduleBookingDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateBookingApis.validateBookingId.bind(validateBookingApis),
      validateBookingApis.validateCreateBookingRequest.bind(
        validateBookingApis
      ),
      this.bookingController.rescheduleBooking.bind(this.bookingController)
    );

    this.bookingRouter.put(
      '/booking/wash',
      validate(BookingWashPaymentDTO, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateBookingApis.validateBookingWashPaymentRequest.bind(
        validateBookingApis
      ),
      validateBookingApis.validateBookingPaymentRequest.bind(
        validateBookingApis
      ),
      validateBookingApis.validateSubscriptionDeduction.bind(
        validateBookingApis
      ),
      this.bookingController.bookingWashPayment.bind(this.bookingController)
    );

    this.bookingRouter.get(
      '/booking/admin/washCounts',
      verifyClient.bind(verifyClient),
      this.bookingController.bookingWashCounts.bind(this.bookingController)
    );

    this.bookingRouter.get(
      '/b2cLedger',
      verifyClient.bind(verifyClient),
      this.bookingController.b2cLedger.bind(this.bookingController)
    );

    this.bookingRouter.get(
      '/bookingMemo/:bookingId',
      // authCustomerGuard.bind(authCustomerGuard),
      this.bookingController.bookingMemo.bind(this.bookingController)
    );
    this.bookingRouter.get(
      '/csv/b2cLedger',
      verifyClient.bind(verifyClient),
      this.bookingController.exportb2cLedger.bind(this.bookingController)
    );
  }
}

export const bookingRoutes = (bookingRouter: any) => {
  return new BookingRoutes(bookingRouter);
};
