import { Joi } from 'express-validation';

export const createReferAndEarDTO = {
  body: Joi.object({
    referAndEarnName: Joi.string().trim().required().messages({
      'any.required': 'Please enter a valid refer & earn name', // Custom message for required validation
      'string.empty': 'Please enter a valid refer & earn name', // Custom message for empty string
    }),
    referAndEarnDescription: Joi.string().trim().required().messages({
      'any.required': 'Refer And Earn Description not allow to be empty', // Custom message for required validation
      'string.empty': 'Refer And Earn Description not allow to be empty', // Custom message for empty string
    }),
    rewardForReferee: Joi.number().positive().required().messages({
      'any.required': 'Reward For Referee not allow to be empty', // Custom message for required validation
      'string.empty': 'Reward For Referee not allow to be empty', // Custom message for empty string
    }),
    rewardForNewUser: Joi.number().min(0).required().messages({
      'any.required': 'Reward For NewUser not allow to be empty', // Custom message for required validation
      'string.empty': 'Reward For NewUser not allow to be empty', // Custom message for empty string
      'number.min': 'Reward For NewUser must be at least 0', // Custom message for values below 0
    }),    
    rewardTypeForNewUser: Joi.string().valid('Amount', 'Wash').required().messages({
      'any.required': 'Reward Type For New User not allow to be empty', // Custom message for required validation
      'string.empty': 'Reward Type For New User not allow to be empty', // Custom message for empty string
    }),
    rewardTypeForReferee: Joi.string().valid('Amount', 'Wash').required().messages({
      'any.required': 'Reward Type For Referee not allow to be empty', // Custom message for required validation
      'string.empty': 'Reward Type For Referee not allow to be empty', // Custom message for empty string
    }),
    startDate: Joi.date().iso().required().messages({
      'any.required': 'Start Date not allow to be empty', // Custom message for required validation
      'string.empty': 'Start Date not allow to be empty', // Custom message for empty string
    }), // Must be greater than current time
    endDate: Joi.date().iso().required().messages({
      'any.required': 'End Date not allow to be empty', // Custom message for required validation
      'string.empty': 'End Date not allow to be empty', // Custom message for empty string
    }), // Must be greater than current time
  }),
};
