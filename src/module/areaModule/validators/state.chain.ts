import { check, param } from 'express-validator';
import { Joi } from 'express-validation';
export const updateStateValidation = {
  body: Joi.object({
    name: Joi.string().trim().optional(),
    regionId: Joi.string().trim().uuid(),
  }),
};

const storeOrUpdate = [
  check('name').exists().isString(),
  check('regionId').exists().isUUID(),
];

export const validateIndexState = [param('limit').optional()];

export const validateStoreState = [...storeOrUpdate];
