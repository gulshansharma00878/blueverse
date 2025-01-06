import { Joi } from 'express-validation';

const updateTermsAndPolicyValidation = {
  body: Joi.object({
    privacy_policy: Joi.string().trim().min(1),
    terms_of_use: Joi.string().trim().min(1),
    isActive: Joi.string().trim().min(1),
  }),
};
export = { updateTermsAndPolicyValidation };
