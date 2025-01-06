import { Joi } from 'express-validation';

/**
 * Data Transfer Object (DTO) for Adding a New Badge
 *
 * This DTO defines the schema for the request body when adding a new badge.
 * It uses Joi for validation to ensure the request contains the necessary fields with the correct data types.
 */
export const addNewBadgeDto = {
  body: Joi.object({
    badgeName: Joi.string().required(), // The name of the badge, required and must be a string
    badgeUrl: Joi.string().required(), // The URL of the badge, required and must be a string
    badgeDescription: Joi.string().required(), // The description of the badge, required and must be a string
    criteria: Joi.number().required(), // The criteria for earning the badge, required and must be a number
  }),
};

/**
 * Data Transfer Object (DTO) for Updating a Badge
 *
 * This DTO defines the schema for the request body when updating an existing badge.
 * It uses Joi for validation to ensure the request contains valid optional fields with the correct data types.
 */
export const updateBadge = {
  body: Joi.object({
    badgeName: Joi.string().optional(), // The name of the badge, optional and must be a string
    badgeUrl: Joi.string().optional(), // The URL of the badge, optional and must be a string
    badgeDescription: Joi.string().optional(), // The description of the badge, optional and must be a string
    criteria: Joi.number().optional(), // The criteria for earning the badge, optional and must be a number
    isActive: Joi.boolean().optional(), // The active status of the badge, optional and must be a boolean
  }),
};
