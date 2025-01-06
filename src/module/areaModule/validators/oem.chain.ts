import { check, param } from 'express-validator';
import { Joi } from 'express-validation';
export const updateOEMValidation = {
  body: Joi.object({
    name: Joi.string().trim().optional(),
    status: Joi.number().optional(),
  }),
};

const storeOrUpdate = [check('name').exists().isString()];

export const validateIndexOem = [param('limit').optional()];

export const validateStoreOem = [...storeOrUpdate];
