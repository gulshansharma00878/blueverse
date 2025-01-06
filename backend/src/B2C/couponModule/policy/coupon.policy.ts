import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { CouponService } from '../services/coupon.service';
import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../.../../../../common/utility';
import moment from 'moment-timezone'; // Import moment library for date/time manipulation

// Class for validating merchant-related requests
class ValidateCoupon {
  private couponService: typeof CouponService;
  constructor() {
    this.couponService = CouponService;
  }

  // Method to validate if the merchant name already exists when adding a new merchant
  async validateNewCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const {
        couponName,
        startDate,
        endDate,
        minOrderValue,
        discountPercentage,
        discountValue,
      } = dataFromRequest(req);
      const coupon = await this.couponService.isCouponNameExist(couponName);
      if (coupon) {
        throw createHttpError(
          400,
          templateConstants.ALREADY_EXIST(
            `A coupon with the name ${couponName}`
          )
        );
      }
      if (
        !isNullOrUndefined(discountValue) &&
        !isNullOrUndefined(minOrderValue) &&
        discountValue > minOrderValue
      ) {
        throw createHttpError(
          400,
          'Minimum order value must be greater than or equal to discount value'
        );
      }
      req.body.startDate = moment(startDate)
        .tz('Asia/Kolkata')
        .startOf('day')
        .toISOString();

      req.body.endDate = moment(endDate)
        .tz('Asia/Kolkata')
        .endOf('day')
        .toISOString();

      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to validate a coupon with this id is exist or not
  async validateCouponId(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const { couponId } = dataFromRequest(req);
      if (!isValidGuid(couponId)) {
        throw createHttpError(400, templateConstants.INVALID(`couponId`));
      }
      const coupon = await this.couponService.isValidCouponId(couponId);
      if (!coupon) {
        throw createHttpError(400, templateConstants.INVALID(`couponId`));
      }

      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateCouponDetails(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract values from request body
      const {
        couponId,
        couponName,
        minOrderValue,
        couponDescription,
        isUnlimited,
        quantity,
        startDate,
        endDate,
        discountPercentage,
        isActive,
        discountValue,
      } = dataFromRequest(req);
      const coupon = await this.couponService.isValidCouponId(couponId);
      if (!isNullOrUndefined(quantity)) {
        if (coupon.usageCount > 0 && quantity < coupon.usageCount) {
          throw createHttpError(
            400,
            'quantity must be greater than usageCount'
          );
        }
      }
      if (
        !isNullOrUndefined(discountValue) &&
        !isNullOrUndefined(minOrderValue) &&
        discountValue > minOrderValue
      ) {
        throw createHttpError(
          400,
          'Minimum order value must be greater than or equal to discount value'
        );
      }
      next(); // Proceed to the next middleware if validation passes
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create an instance of the validation class and export it
const validateCoupon = new ValidateCoupon();
export { validateCoupon };
