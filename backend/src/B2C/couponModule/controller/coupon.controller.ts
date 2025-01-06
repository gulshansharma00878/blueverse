import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { BookingService } from '../../bookingModule/services/booking.service';

import { templateConstants } from '../../../common/templateConstants';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { CouponService } from '../services/coupon.service';
import { isNullOrUndefined } from '../../../common/utility';

export class CouponController {
  private bookingService: typeof BookingService;
  constructor() {
    this.bookingService = BookingService;
  }

  // Method to get details of a coupon
  async addNewCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        couponName,
        couponDescription,
        minOrderValue,
        isUnlimited,
        allowMultipleTimeUse,
        quantity,
        startDate,
        endDate,
        discountPercentage,
        discountValue,
      } = dataFromRequest(req);
      const newBody = {
        couponName: couponName,
        couponDescription: couponDescription,
        minOrderValue: minOrderValue,
        isUnlimited: isUnlimited,
        allowMultipleTimeUse: allowMultipleTimeUse,
        quantity: quantity,
        startDate: startDate,
        endDate: endDate,
        discountPercentage: discountPercentage,
        discountValue: discountValue,
      };
      const newCoupon = await CouponService.addNewCoupon(newBody);
      // Prepare response
      res.locals.response = {
        message: templateConstants.CREATED_SUCCESSFULLY('Coupon'),
        body: {
          data: newCoupon,
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Method to get list of a coupon
  async getCouponList(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, search, sortBy, orderBy } = dataFromRequest(req);
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const queryBody = {
        limit: _limit,
        offset: _offset,
        search,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc'
      };
      const coupon = await CouponService.getCouponList(queryBody);
      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Coupon'),
        body: {
          data: {
            coupon: coupon.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              coupon.count
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // API to get coupon details
  async getCouponDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { couponId } = dataFromRequest(req);
      const coupon = await CouponService.getCouponDetails(couponId);
      // Prepare response
      res.locals.response = {
        message: templateConstants.DETAIL('Coupon'),
        body: {
          data: {
            coupon: coupon,
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // API to update coupon details
  async updateCouponDetails(req: Request, res: Response, next: NextFunction) {
    try {
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
        allowMultipleTimeUse,
        discountValue,
      } = dataFromRequest(req);
      const updateCouponObj: any = {};
      if (!isNullOrUndefined(couponName)) {
        updateCouponObj['couponName'] = couponName;
      }
      if (!isNullOrUndefined(couponDescription)) {
        updateCouponObj['couponDescription'] = couponDescription;
      }
      if (!isNullOrUndefined(minOrderValue)) {
        updateCouponObj['minOrderValue'] = minOrderValue;
      }
      if (!isNullOrUndefined(isUnlimited)) {
        updateCouponObj['isUnlimited'] = isUnlimited;
      }
      if (!isNullOrUndefined(quantity)) {
        updateCouponObj['quantity'] = quantity;
      }
      if (!isNullOrUndefined(startDate)) {
        updateCouponObj['startDate'] = startDate;
      }
      updateCouponObj['endDate'] = endDate;
      if (!isNullOrUndefined(discountPercentage)) {
        updateCouponObj['discountPercentage'] = discountPercentage;
        updateCouponObj['discountValue'] = null;
      }
      if (!isNullOrUndefined(discountValue)) {
        updateCouponObj['discountValue'] = discountValue;
        updateCouponObj['discountPercentage'] = null;
      }
      // updateCouponObj['discountValue'] = discountValue;
      // updateCouponObj['discountPercentage'] = discountPercentage;
      if (!isNullOrUndefined(isActive)) {
        updateCouponObj['isActive'] = isActive;
      }
      if (!isNullOrUndefined(allowMultipleTimeUse)) {
        updateCouponObj['allowMultipleTimeUse'] = allowMultipleTimeUse;
      }
      await CouponService.updateCouponBody(updateCouponObj, couponId);
      // Prepare response
      res.locals.response = {
        message: templateConstants.UPDATED_SUCCESSFULLY('Coupon'),
        body: {
          data: {},
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // API to delete coupon
  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { couponId } = dataFromRequest(req);
      const coupon = await CouponService.deleteCoupon(couponId);
      // Prepare response
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Coupon'),
        body: {
          data: {
            coupon: coupon,
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  // Customer coupon list
  async getCustomerCouponList(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        limit,
        offset,
        search,
        sortBy,
        orderBy,
        washPrice,
        washDate,
        loggedInUser,
      } = dataFromRequest(req);

      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const queryBody = {
        limit: _limit,
        offset: _offset,
        search,
        sortBy: isNullOrUndefined(sortBy) ? 'createdAt' : sortBy, // Default sort by 'createdAt'
        orderBy:
          !isNullOrUndefined(orderBy) &&
          ['asc', 'desc'].includes(orderBy.toLowerCase())
            ? orderBy
            : 'desc', // Default order by 'desc',
        washPrice,
        date: !isNullOrUndefined(washDate) ? washDate : new Date(),
      };
      // get the list of customer one time used coupons
      const oneTimeUsedCoupons =
        await this.bookingService.getCustomeOneTimeUsedCoupons(
          loggedInUser.userId
        );
      // fetch coupon list
      const coupon = await CouponService.getCustomerCouponList(
        queryBody,
        oneTimeUsedCoupons
      );
      const bestCoupon = CouponService.getBestCoupon(
        coupon.rows,
        Number(washPrice)
      );
      // Prepare response
      res.locals.response = {
        message: templateConstants.LIST_OF('Coupon'),
        body: {
          data: {
            bestCoupon: bestCoupon,
            coupon: coupon.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              coupon.count
            ), // Format pagination data
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }

  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        couponId,
        washPrice,
        date = new Date(),
        loggedInUser,
      } = dataFromRequest(req);
      let isActive = false;
      let message =
        'Selected coupon is not available please choose another one';
      const oneTimeUsedCoupons =
        await this.bookingService.getCustomeOneTimeUsedCoupons(
          loggedInUser.userId
        );
      const coupon = await CouponService.validateCoupon(
        couponId,
        washPrice,
        date,
        oneTimeUsedCoupons
      );
      if (coupon) {
        isActive = true;
        message = 'Coupon is available';
      }
      res.locals.response = {
        message: message,
        body: {
          data: {
            verifed: isActive,
          },
        },
      };
      next();
    } catch (err) {
      next(err); // Pass error to error handling middleware
    }
  }
}

// Create instance of CouponController
const couponController = new CouponController();
export { couponController };
