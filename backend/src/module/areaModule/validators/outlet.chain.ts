import { check, param } from 'express-validator';

const storeOrUpdate = [
  check('name').exists().isString(),
  check('cityId').exists().isUUID(),
];

export const validateIndexOutlet = [param('limit').optional()];

export const validateStoreOutlet = [...storeOrUpdate];
