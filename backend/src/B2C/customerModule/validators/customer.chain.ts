import { Joi } from 'express-validation';

export const customerUpdate = {
  body: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    email: Joi.string().trim().allow(null, '').optional(),
    address: Joi.string().trim().allow(null, '').optional(),
    phone: Joi.string().trim().required(),
    gender: Joi.string().trim().valid('male', 'female', 'other').optional(), // Gender validation
    image: Joi.string().trim().allow(null, '').optional(),
    cityId: Joi.string().guid().trim().optional(),
    stateId: Joi.string().guid().trim().optional(),
    pincode: Joi.string().trim().optional(),
  }),
};

export const getCustomer = {
  query: Joi.object({
    offset: Joi.number().default(1),
    limit: Joi.number().default(10),
    sortBy: Joi.string().trim().default('createdAt'),
    orderBy: Joi.string().trim().valid('asc', 'desc').default('desc'),
    search: Joi.string().trim().allow(null, '').optional(),
    state: Joi.string().trim().allow(null, '').optional(),
    region: Joi.string().trim().allow(null, '').optional(),
    city: Joi.string().trim().allow(null, '').optional(),
    vehicleType: Joi.string().trim().allow(null, '').optional(),
  }),
};
