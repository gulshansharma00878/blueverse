import { Joi } from 'express-validation';
import { VehicleType } from '../../models/vehicle';
export const addSubscriptionDTO = {
  body: Joi.object({
    subscriptionName: Joi.string().trim().required(), // Ensure balance is a positive number
    subscriptionDescription: Joi.string().trim().required(),
    price: Joi.number().required(),
    silverWashOffered: Joi.number().required(),
    goldWashOffered: Joi.number().required(),
    platinumWashOffered: Joi.number().required(),
    silverServiceOffered: Joi.string().allow('').optional(),
    goldServiceOffered: Joi.string().allow('').optional(),
    platinumServiceOffered: Joi.string().allow('').optional(),
    subscriptionDays: Joi.number().required(),
    subscriptionCreatedOn: Joi.date().iso().required().messages({
      'date.base': 'Please add a valid created date', // For invalid date types
      'date.format': 'Please add a valid created date in ISO format', // For non-ISO format dates
      'any.required': 'Please add a valid created date', // If the field is missing
    }), // Must be greater than current time
    vehicleType: Joi.string()
      .allow(VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER)
      .required(),
  }),
};
export const updateSubscriptionDTO = {
  body: Joi.object({
    subscriptionName: Joi.string().trim().optional(), // Ensure balance is a positive number
    subscriptionDescription: Joi.string().trim().optional(),
    price: Joi.number().positive().optional(),
    silverWashOffered: Joi.number().optional(),
    goldWashOffered: Joi.number().optional(),
    platinumWashOffered: Joi.number().optional(),
    silverServiceOffered: Joi.string().allow('').optional(),
    goldServiceOffered: Joi.string().allow('').optional(),
    platinumServiceOffered: Joi.string().allow('').optional(),
    subscriptionDays: Joi.number().positive().optional(),
    subscriptionCreatedOn: Joi.date().iso().optional(), // Must be greater than current time
    isActive: Joi.boolean().optional(),
    vehicleType: Joi.string()
      .allow(VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER)
      .optional(),
  }),
};

export const buySubscriptionDTO = {
  body: Joi.object({
    subscriptionId: Joi.string().trim().required(), // Ensure balance is a positive number
  }),
};
