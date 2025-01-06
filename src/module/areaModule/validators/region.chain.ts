import { check, param } from 'express-validator';

const storeOrUpdate = [check('name').exists().isString()];

export const validateIndexRegion = [param('limit').optional()];

export const validateStoreRegion = [...storeOrUpdate];
