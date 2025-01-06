import { check, param } from 'express-validator';
import { Joi } from 'express-validation';

const storeOrUpdate = [check('name').exists().isString()];

const validateIndexMachine = [param('limit').optional()];

const validateStoreMachine = [...storeOrUpdate];

const validateUpdateMachineStatus = {
  body: Joi.object({
    status: Joi.string()
      .trim()
      .valid('ACTIVE', 'INACTIVE', 'SUSPENDED')
      .required(),
  }),
};
export = {
  validateUpdateMachineStatus,
  validateStoreMachine,
  validateIndexMachine,
};
