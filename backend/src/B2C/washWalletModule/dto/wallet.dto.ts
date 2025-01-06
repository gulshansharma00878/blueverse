import { Joi } from 'express-validation';

export const addWashDTO = {
  body: Joi.object({
    noOfWash: Joi.number().positive().required(), // Ensure balance is a positive number
  }),
};