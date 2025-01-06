import { Joi } from 'express-validation';

export const brandValidation = {
  body: Joi.object({
    name: Joi.string().trim().required(),
    isTwoWheeler: Joi.boolean().required(),
    isFourWheeler: Joi.boolean().required(),
  }),
};


// DTO for updating an additional service
export const brandUpdateDTO = {
  body: Joi.object({
    name: Joi.string().optional(), // The name of the additional service is optional and must be a string if provided
    isActive: Joi.boolean().optional(), // The active status of the additional service is optional and must be a boolean if provided
    isTwoWheeler: Joi.boolean().optional(),
    isFourWheeler: Joi.boolean().optional(),
  }),
};