import { Joi } from 'express-validation';

// DTO for adding a new additional service
export const additionalSeriveAddDTO = {
  body: Joi.object({
    additionalServiceName: Joi.string().required(), // The name of the additional service is required and must be a string
    isTwoWheeler: Joi.boolean().required(),
    isFourWheeler: Joi.boolean().required(),
  }),
};

// DTO for updating an additional service
export const additionalSeriveUpdateDTO = {
  body: Joi.object({
    additionalServiceName: Joi.string().optional(), // The name of the additional service is optional and must be a string if provided
    isActive: Joi.boolean().optional(), // The active status of the additional service is optional and must be a boolean if provided
    isTwoWheeler: Joi.boolean().optional(),
    isFourWheeler: Joi.boolean().optional(),
  }),
};

// DTO for updating the status of an additional service
export const additionalSeriveStatusUpdateDTO = {
  body: Joi.object({
    isActive: Joi.boolean().optional(), // The active status of the additional service is optional and must be a boolean if provided
  }),
};
