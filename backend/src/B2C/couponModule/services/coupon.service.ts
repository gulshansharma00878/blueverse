import { col, Op, WhereOptions } from 'sequelize';
import { Coupon } from '../../models/coupon';
import { isNullOrUndefined } from '../../../common/utility';
class CouponServices {
  async addNewCoupon(body: any) {
    try {
      return await Coupon.create(body);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async isCouponNameExist(couponName: string) {
    try {
      return await Coupon.findOne({
        where: {
          couponName: couponName,
          deletedAt: null,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCouponList(queryBody: any) {
    try {
      const { limit, offset, search, sortBy, orderBy } = queryBody;
      const whereCondition: WhereOptions = {
        deletedAt: null,
      };
      if (search) {
        whereCondition['couponName'] = {
          [Op.iLike]: `%${decodeURIComponent(search)}%`,
        };
      }
      return await Coupon.findAndCountAll({
        where: whereCondition,
        limit: limit,
        offset: offset,
        order: [[sortBy, orderBy]],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCouponDetails(couponId: string) {
    try {
      return await Coupon.findOne({
        where: {
          couponId: couponId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async deleteCoupon(couponId: string) {
    try {
      return await Coupon.update(
        {
          deletedAt: new Date(),
        },
        {
          where: {
            couponId: couponId,
          },
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async isValidCouponId(couponId: string) {
    try {
      return await Coupon.findOne({
        where: {
          couponId: couponId,
          deletedAt: null,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateCouponBody(updateCouponObj: any, couponId: string) {
    try {
      return await Coupon.update(updateCouponObj, {
        where: {
          couponId: couponId,
        },
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getCustomerCouponList(queryBody: any, oneTimeUsedCoupoIds: string[]) {
    try {
      const { limit, offset, search, sortBy, orderBy, washPrice, date } =
        queryBody;
      const whereConditions: any = {
        [Op.and]: [
          {
            startDate: {
              [Op.lte]: date,
            },
          },
          {
            endDate: {
              [Op.gte]: date,
            },
          },
          // {
          //   minOrderValue: {
          //     [Op.lte]: washPrice,
          //   },
          // },
          {
            [Op.or]: [
              {
                quantity: {
                  [Op.and]: [
                    {
                      [Op.gt]: 0,
                    },
                    {
                      [Op.gt]: col('usage_count'),
                    },
                  ],
                },
              },
              {
                isUnlimited: true,
              },
            ],
          },
          {
            deletedAt: null,
          },
          {
            isActive: true,
          },
        ],
      };

      if (search) {
        whereConditions[Op.and].push({
          [Op.or]: [
            {
              couponName: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        });
      }
      // Hide all the coupons that have already been used by the customer and are valid for single use only.
      if (oneTimeUsedCoupoIds.length > 0) {
        whereConditions['couponId'] = {
          [Op.notIn]: oneTimeUsedCoupoIds,
        };
      }

      // const condition = {
      //   where: whereConditions,
      //   limit: limit,
      //   offset: offset,
      //   order: [[sortBy, orderBy]],
      // };
      return await Coupon.findAndCountAll({
        attributes: [
          'couponId',
          'uniqueId',
          'couponName',
          'couponDescription',
          'minOrderValue',
          'discountPercentage',
          'discountValue',
          'startDate',
          'endDate',
        ],
        where: whereConditions,
        limit: limit,
        offset: offset,
        order: [[sortBy, orderBy]],
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async updateCouponAvailCount(couponId: string) {
    try {
      const coupon = await Coupon.findByPk(couponId);
      if (coupon) {
        coupon.usageCount += 1;
        await coupon.save();
      } else {
        throw new Error('Coupon not found');
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async validateCoupon(
    couponId: string,
    washPrice: number,
    date: Date,
    oneTimeUsedCoupoIds: string[]
  ) {
    try {
      const whereConditions: any = {
        [Op.and]: [
          {
            startDate: {
              [Op.lte]: date,
            },
          },
          {
            endDate: {
              [Op.gte]: date,
            },
          },
          {
            minOrderValue: {
              [Op.lte]: washPrice,
            },
          },
          {
            [Op.or]: [
              {
                quantity: {
                  [Op.and]: [
                    {
                      [Op.gt]: 0,
                    },
                    {
                      [Op.gt]: col('usage_count'),
                    },
                  ],
                },
              },
              {
                isUnlimited: true,
              },
            ],
          },
          {
            deletedAt: null,
          },
          {
            isActive: true,
          },
          { couponId: couponId },
        ],
      };
      if (oneTimeUsedCoupoIds.length > 0) {
        whereConditions['couponId'] = {
          [Op.notIn]: oneTimeUsedCoupoIds,
        };
      }
      return await Coupon.findOne({
        where: whereConditions,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getBestCoupon(coupons: any, priceAmount: number) {
    try {
      let bestCoupon: Coupon | null = null;
      let maxDiscountAmount = 0;

      // Iterate over each coupon
      for (const coupon of coupons) {
        // Check if the coupon meets the minimum order value requirement
        if (priceAmount >= coupon.minOrderValue) {
          // Calculate the discount amount
          const discountAmount = Math.max(
            !isNullOrUndefined(coupon.discountPercentage)
              ? (priceAmount * coupon.discountPercentage) / 100
              : 0,
            coupon.discountValue || 0
          );

          // Check if this coupon offers a better discount
          if (discountAmount > maxDiscountAmount) {
            maxDiscountAmount = discountAmount;
            bestCoupon = coupon;
          }
        }
      }

      // Return the best coupon and the discount amount
      return {
        coupon: bestCoupon,
        discountAmount: maxDiscountAmount,
      };
    } catch (err) {
      console.log(err);
    }
  }
}

// Create an instance of CouponServices and export it
const CouponService = new CouponServices();
export { CouponService };
