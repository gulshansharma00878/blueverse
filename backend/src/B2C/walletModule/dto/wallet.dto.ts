import { Joi } from 'express-validation';

export const addMoneyDTO = {
  body: Joi.object({
    balance: Joi.number().positive().required(), // Ensure balance is a positive number
  }),
};