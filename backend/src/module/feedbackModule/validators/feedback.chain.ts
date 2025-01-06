import { check, param } from 'express-validator';
import { Joi } from 'express-validation';

const storeOrUpdate = [check('name').exists().isString()];

export const validateIndexFeedback = [param('limit').optional()];
export const validateSubmitCustomerFeedbackForm = {
  body: Joi.object({
    form_id: Joi.string().trim().uuid().required(),
    question_responses: Joi.array()
      .items(
        Joi.object()
          .keys({
            question_id: Joi.string().trim().uuid().required().messages({
              'string.empty': `"question_id" cannot be an empty field`,
              'any.required': `"question_id" is a required field`,
            }),
            response: Joi.string().trim().allow(null, '').required(),
          })
          .required()
      )
      .required(),
    sku_number: Joi.string().trim().required(),
  }),
};

export const validateStoreFeedback = [...storeOrUpdate];
