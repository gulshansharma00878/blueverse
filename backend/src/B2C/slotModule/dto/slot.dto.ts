import { Joi } from 'express-validation';

export const getSlot = {
  query: Joi.object({
    date: Joi.string().trim().required(),
    merchantId: Joi.string().trim().required(),
  }),
};
