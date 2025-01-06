import { validate } from 'express-validation';
import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { couponController } from './controller/coupon.controller';
import {
  addNewCouponDto,
  updateCouponDto,
  getCustomerCouponList,
  validateCouponDto,
} from './dto/coupon.dto';
import { validateCoupon } from './policy/coupon.policy';
class CouponRoutes {
  private couponController: typeof couponController;

  constructor(private couponRouter: any) {
    // Initialize the couponRouter and couponController
    this.couponRouter = couponRouter;
    this.couponController = couponController;
    this.registerRoutes(); // Call method to register routes
  }

  private registerRoutes() {
    // API to add new coupon
    this.couponRouter.post(
      '/coupon',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validate(addNewCouponDto, {}, {}),
      validateCoupon.validateNewCoupon.bind(validateCoupon),
      this.couponController.addNewCoupon.bind(this.couponController) // Route handler to add coupon
    );
    // API to get listof new coupon
    this.couponRouter.get(
      '/coupon',
      verifyClient.bind(verifyClient), // Middleware to verify client
      this.couponController.getCouponList.bind(this.couponController) // Route handler to add coupon
    );

    // API to get coupon details
    this.couponRouter.get(
      '/coupon/:couponId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateCoupon.validateCouponId.bind(validateCoupon),
      this.couponController.getCouponDetails.bind(this.couponController) // Route handler to add coupon
    );

    // API to update coupon details
    this.couponRouter.put(
      '/coupon/:couponId',
      verifyClient.bind(verifyClient),
      validate(updateCouponDto, {}, {}),
      // Middleware to verify client
      validateCoupon.validateCouponId.bind(validateCoupon),
      validateCoupon.validateCouponDetails.bind(validateCoupon),
      this.couponController.updateCouponDetails.bind(this.couponController) // Route handler to add coupon
    );
    // API to delete coupon details
    this.couponRouter.delete(
      '/coupon/:couponId',
      verifyClient.bind(verifyClient), // Middleware to verify client
      validateCoupon.validateCouponId.bind(validateCoupon),
      this.couponController.deleteCoupon.bind(this.couponController) // Route handler to add coupon
    );

    // API to get customer coupon details
    this.couponRouter.get(
      '/coupon/available/list',
      // validate(getCustomerCouponList, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      this.couponController.getCustomerCouponList.bind(this.couponController) // Route handler to add coupon
    );

    // API to verify coupon is available or not
    this.couponRouter.post(
      '/coupon/validate/:couponId',
      validate(validateCouponDto, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      validateCoupon.validateCouponId.bind(validateCoupon),
      this.couponController.validateCoupon.bind(this.couponController) // Route handler to add coupon
    );
  }
}

// Export function to create coupon routes
export const couponRoutes = (couponRouter: any) => {
  return new CouponRoutes(couponRouter);
};
