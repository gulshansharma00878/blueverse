import { Joi } from 'express-validation';

export const addNewHoliday = {
  body: Joi.object({
    holidayName: Joi.string().required(), // The name of the badge, required and must be a string
    holidayDate: Joi.string().required(), // The URL of the badge, required and must be a string
  }),
};
