import { Joi } from 'express-validation';
const updateFeedbackGenerate = {
  body: Joi.object({
    email_id: Joi.string().trim().email().optional(),
    name: Joi.string().trim().optional(),
    phone: Joi.string().trim().min(10).max(15),
    manufacturer: Joi.string().trim().optional(),
    hsrp_number: Joi.string().trim().optional(),
    bike_model: Joi.string().trim().optional(),
  }),
};
export = { updateFeedbackGenerate };
