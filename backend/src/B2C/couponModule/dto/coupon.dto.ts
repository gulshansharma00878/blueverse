import { Joi } from 'express-validation';

// DTO for adding a new additional service
export const addNewCouponDto = {
  body: Joi.object({
    couponName: Joi.string().required(),
    couponDescription: Joi.string().required(),
    minOrderValue: Joi.number().required(),
    isUnlimited: Joi.boolean().required(),
    allowMultipleTimeUse: Joi.boolean().optional(),
    quantity: Joi.when('isUnlimited', {
      is: true,
      then: Joi.any().valid(null).optional(),
      otherwise: Joi.number().required(),
    }),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).allow(null).optional(),
    discountPercentage: Joi.number().min(0).max(100).allow(null).optional(),
    discountValue: Joi.number().optional().allow(null),
  }),
};

export const updateCouponDto = {
  body: Joi.object({
    couponName: Joi.string().optional(),
    couponDescription: Joi.string().optional(),
    minOrderValue: Joi.number().optional(),
    isUnlimited: Joi.boolean().optional(),
    allowMultipleTimeUse: Joi.boolean().optional(),
    quantity: Joi.when('isUnlimited', {
      is: true,
      then: Joi.any().valid(null).optional(),
      otherwise: Joi.number().optional(),
    }),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).allow(null).optional(),
    discountPercentage: Joi.number().min(0).max(100).allow(null).optional(),
    discountValue: Joi.number().optional().allow(null),
    isActive: Joi.boolean().optional(),
  }),
};

export const getCustomerCouponList = {
  params: Joi.object({
    // washDate: Joi.string().allow(null).required(),
    limit: Joi.number().integer().min(0).optional(),
    offset: Joi.number().integer().min(0).optional(),
    search: Joi.string().trim().allow('').optional(),
    sortBy: Joi.string().trim().optional(),
    orderBy: Joi.string().trim().valid('ASC', 'DESC', 'asc', 'desc').optional(),
    washPrice: Joi.number().required(),
  }),
};

export const validateCouponDto = {
  body: Joi.object({
    washPrice: Joi.number().required(),
    date: Joi.string().trim().optional(),
  }),
};
