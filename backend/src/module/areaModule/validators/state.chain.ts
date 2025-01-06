import { check, param } from 'express-validator';
import { Joi } from 'express-validation';
export const updateStateValidation = {
  body: Joi.object({
    name: Joi.string().trim().optional(),
    regionId: Joi.string().trim().uuid(),
    stateGstNo: Joi.string().allow('').trim(),
    blueverseAddress: Joi.string().allow('').trim().optional(),
    blueverseEmail: Joi.string().email().allow('', null).trim().optional(),
  }),
};

export const cityDetailValidate = {
  body: Joi.object({
    cityName: Joi.string().trim().required(),
    stateName: Joi.string().trim().required(),
  }),
};
const storeOrUpdate = [
  check('name').exists().isString(),
  check('regionId').exists().isUUID(),
];

export const validateIndexState = [param('limit').optional()];

export const validateStoreState = [...storeOrUpdate];
