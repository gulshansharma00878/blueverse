import { check, param } from 'express-validator';
import { Joi } from 'express-validation';
export const updateCityValidation = {
  body: Joi.object({
    name: Joi.string().trim().optional(),
    stateId: Joi.string().trim().uuid(),
  }),
};

const storeOrUpdate = [
  check('name').exists().isString(),
  check('stateId').exists().isUUID(),
];

export const validateIndexCity = [param('limit').optional()];

export const validateStoreCity = [...storeOrUpdate];
