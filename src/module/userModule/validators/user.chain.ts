import { Joi } from 'express-validation';
const createAgentValidation = {
  body: Joi.object({
    username: Joi.string().trim().min(1).required(),
    email: Joi.string().trim().email().required().messages({
      'string.empty': `Email address cannot be an empty field`,
      'any.required': `Email address is required `,
      'string.email': 'Email address must be a valid email address.',
    }),
    phone: Joi.string().trim().max(14),
    is_active: Joi.boolean().required(),
  }),
};
const updateAgentValidation = {
  body: Joi.object({
    username: Joi.string().trim().optional(),
    email: Joi.string().trim().email().optional(),
    phone: Joi.string().trim().optional().max(14),
    is_active: Joi.boolean().optional(),
  }),
};
const verifyOtpValidation = {
  body: Joi.object({
    email: Joi.string().trim().email().required(),
    verification_code: Joi.number().required(),
  }),
};

const validateUpdatePassword = {
  body: Joi.object({
    old_password: Joi.string().trim().required(),
    new_password: Joi.string().trim().required(),
  }),
};

const validateUpdateProfile = {
  body: Joi.object({
    profile_img: Joi.string().trim().optional(),
    phone: Joi.string().trim().min(6).max(14).optional(),
    address: Joi.string().trim().optional(),
    username: Joi.string().trim().optional(),
  }),
};

const validateCreateSubRoleRequest = {
  body: Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().optional(),
    isActive: Joi.boolean().required(),
    dealerId: Joi.string().trim().uuid().optional(),
    permissions: Joi.array()
      .items(
        Joi.object()
          .keys({
            moduleId: Joi.string().uuid().required().messages({
              'string.empty': `"moduleId" cannot be an empty field`,
              'any.required': `"moduleId" is a required field`,
            }),
            deletePermission: Joi.boolean().optional(),
            updatePermission: Joi.boolean().optional(),
            createPermission: Joi.boolean().optional(),
            viewPermission: Joi.boolean().optional(),
            exportPermission: Joi.boolean().optional(),
          })
          .required()
      )
      .required(),
  }),
};

const validateUpdateSubRole = {
  body: Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().trim().optional(),
    isActive: Joi.boolean().optional(),
    permissions: Joi.array()
      .items(
        Joi.object()
          .keys({
            moduleId: Joi.string().trim().uuid().required().messages({
              'string.empty': `"moduleId" cannot be an empty field`,
              'any.required': `"moduleId" is a required field`,
            }),
            deletePermission: Joi.boolean().optional().messages({
              'any.required': `"permission deletePermission" is a required field`,
            }),
            updatePermission: Joi.boolean().optional().messages({
              'any.required': `"permission updatePermission" is a required field`,
            }),
            createPermission: Joi.boolean().optional().messages({
              'any.required': `"permission createPermission" is a required field`,
            }),
            viewPermission: Joi.boolean().optional().messages({
              'any.required': `"permission viewPermission" is a required field`,
            }),
            exportPermission: Joi.boolean().optional().messages({
              'any.required': `"permission exportPermission" is a required field`,
            }),
            action: Joi.string()
              .trim()
              .valid('UPDATE', 'CREATE', 'DELETE')
              .required()
              .messages({
                'string.empty': `"action" cannot be an empty field`,
                'any.required': `"action" is a required field`,
              }),
          })
          .optional()
      )
      .required(),
  }),
};
const validateCreateEmployee = {
  body: Joi.object({
    username: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().min(6).max(16).optional(),
    parentUserId: Joi.string().trim().uuid().optional(),
    subRoleId: Joi.string().trim().uuid().required(),
    isActive: Joi.boolean().required(),
  }).required(),
};

const validateUpdateEmployee = {
  body: Joi.object({
    username: Joi.string().trim().trim().optional(),
    email: Joi.string().trim().email().trim().optional(),
    phone: Joi.string().trim().allow(null).min(6).max(16).trim().optional(),
    subRoleId: Joi.string().trim().uuid().optional(),
    isActive: Joi.boolean().optional(),
  }).required(),
};

export = {
  createAgentValidation,
  updateAgentValidation,
  verifyOtpValidation,
  validateUpdatePassword,
  validateUpdateProfile,
  validateCreateSubRoleRequest,
  validateUpdateSubRole,
  validateCreateEmployee,
  validateUpdateEmployee,
};
