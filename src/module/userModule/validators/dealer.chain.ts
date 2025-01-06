import { Joi } from 'express-validation';
const validateCreateDealerValidation = {
  body: Joi.object({
    oem_id: Joi.string().trim().uuid().required(),
    username: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().min(6).max(16).required(),
    pan_no: Joi.string().trim().uppercase().required(),
    outlets: Joi.array()
      .items(
        Joi.object()
          .keys({
            name: Joi.string().trim().required().messages({
              'string.empty': `"outlet name" cannot be an empty field`,
              'any.required': `"outlet name" is a required field`,
            }),
            gst_no: Joi.string().trim().required().messages({
              'string.empty': `"outlet gst no" cannot be an empty field`,
              'any.required': `"outlet gst no" is a required field`,
            }),
            city_id: Joi.string().trim().uuid().required().messages({
              'string.empty': `"outlet city id" cannot be an empty field`,
              'any.required': `"outlet city id" is a required field`,
            }),
            address: Joi.string().trim().required().messages({
              'string.empty': `"outlet address" cannot be an empty field`,
              'any.required': `"outlet adsress" is a required field`,
            }),
          })
          .required()
      )
      .required(),
    documents: Joi.array()
      .items(
        Joi.object()
          .keys({
            name: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': `"document name" cannot be an empty field`,
                'any.required': `"document name" is a required field`,
              })
              .required(),
            url: Joi.string()
              .trim()
              .required()
              .messages({
                'string.empty': `"document url" cannot be an empty field`,
                'any.required': `"document url" is a required field`,
              })
              .required(),
          })
          .optional()
      )
      .optional(),
  }),
};
const validateAssignMachineToDealerOutlet = {
  body: Joi.object({
    data: Joi.array()
      .items(
        Joi.object()
          .keys({
            outlet_id: Joi.string().trim().uuid().required().messages({
              'string.empty': `"outlet_id" cannot be an empty field`,
              'any.required': `"outlet_id" is a required field`,
            }),
            machine_ids: Joi.array()
              .items(Joi.string().trim().uuid().required())
              .required()
              .messages({
                'any.required': `"machine ids" is a required field`,
              }),
          })
          .required()
      )
      .required(),
  }),
};

const validateUpdateDealerRequest = {
  body: Joi.object({
    is_active: Joi.boolean().optional(),
    oem_id: Joi.string().trim().uuid().optional(),
    username: Joi.string().trim().required(),
    email: Joi.string().trim().email().optional(),
    phone: Joi.string().trim().min(6).max(16).optional(),
    pan_no: Joi.string().trim().uppercase().optional(),
    outlets: Joi.array()
      .items(
        Joi.object()
          .keys({
            name: Joi.string().trim().required().messages({
              'string.empty': `"outlet name" cannot be an empty field`,
              'any.required': `"outlet name" is a required field`,
            }),
            gst_no: Joi.string().trim().required().messages({
              'string.empty': `"gst no" cannot be an empty field`,
              'any.required': `"gst no" is a required field`,
            }),
            city_id: Joi.string().trim().uuid().required().messages({
              'string.empty': `"city id" cannot be an empty field`,
              'any.required': `"city id" is a required field`,
            }),
            address: Joi.string().trim().required().messages({
              'string.empty': `"outlet address" cannot be an empty field`,
              'any.required': `"outlet address" is a required field`,
            }),
            action: Joi.string()
              .trim()
              .valid('UPDATE', 'CREATE')
              .required()
              .messages({
                'string.empty': `"outlet action" cannot be an empty field`,
                'any.required': `"outlet action" is a required field`,
              }),
            outlet_id: Joi.string().trim().uuid().optional(),
          })
          .required()
      )
      .optional(),
    documents: Joi.array()
      .items(
        Joi.object()
          .keys({
            name: Joi.string().trim().required().messages({
              'string.empty': `"document name" cannot be an empty field`,
              'any.required': `"document name" is a required field`,
            }),
            url: Joi.string().trim().required().messages({
              'string.empty': `"document url" cannot be an empty field`,
              'any.required': `"document url" is a required field`,
            }),
            action: Joi.string()
              .trim()
              .valid('UPDATE', 'DELETE', 'CREATE')
              .required(),
            document_id: Joi.string().trim().uuid().optional(),
          })
          .optional()
      )
      .optional(),
  }).required(),
};

const validateDealerSubscriptionSetting = {
  body: Joi.object({
    policies: Joi.array()
      .items(
        Joi.object()
          .keys({
            outlet_id: Joi.string().trim().uuid().required(),
            machines: Joi.array()
              .items(
                Joi.object()
                  .keys({
                    machine_id: Joi.string().trim().uuid().required().messages({
                      'string.empty': `"machine id" cannot be an empty field`,
                      'any.required': `"machine id" is a required field`,
                    }),
                    security_deposited: Joi.number()
                      .required()
                      .min(0)
                      .messages({
                        'any.required': `"machine security deposited" is a required field`,
                      }),
                    billing_cycle: Joi.number().required().min(1).messages({
                      'any.required': `"machine billing cycle" is a required field`,
                    }),
                    invoice_date: Joi.number().min(1).required().messages({
                      'any.required': `"machine invoice date" is a required field`,
                    }),
                    minimum_wash_commitment: Joi.number()
                      .required()
                      .min(0)
                      .messages({
                        'any.required': `"machine minimum wash commitment" is a required field`,
                      }),
                    pricing_terms: Joi.array()
                      .items(
                        Joi.object()
                          .keys({
                            manpowerPricePerWash: Joi.number()
                              .min(0)
                              .default(0),
                            dealerPerWashPrice: Joi.number()
                              .min(0)
                              .required()
                              .messages({
                                'any.required': `"machine pricing terms dealer per wash price" is a required field`,
                              }),
                            type: Joi.string().trim().required().messages({
                              'string.empty': `"pricing term type" cannot be an empty field`,
                              'any.required': `"pricing term type" is a required field`,
                            }),
                          })
                          .required()
                      )
                      .required(),
                    taxable_amount: Joi.number().required().min(0).messages({
                      'any.required': `"machine taxable amount" is a required field`,
                    }),
                    cgst: Joi.number().required().min(0).messages({
                      'any.required': `"machine cgst" is a required field`,
                    }),
                    sgst: Joi.number().required().min(0).messages({
                      'any.required': `"machine sgst" is a required field`,
                    }),
                    total: Joi.number().required().min(0).messages({
                      'any.required': `"machine total" is a required field`,
                    }),
                  })
                  .required()
              )
              .required(),
          })
          .required()
      )
      .required(),
  }).required(),
};

const validateUpdateOutletAssignMachine = {
  body: Joi.object({
    data: Joi.array()
      .items(
        Joi.object()
          .keys({
            outlet_id: Joi.string().trim().uuid().required().messages({
              'any.required': `"outlet id" is a required field`,
            }),
            machines: Joi.array()
              .items(
                Joi.object().keys({
                  action: Joi.string()
                    .trim()
                    .valid('CREATE', 'DELETE')
                    .required()
                    .messages({
                      'any.required': `"machine action" is a required field`,
                    }),
                  machineGuid: Joi.string().trim().uuid().required().messages({
                    'any.required': `"machine guid" is a required field`,
                  }),
                })
              )
              .required(),
          })
          .required()
      )
      .required(),
  }),
};

const validateUpdateDealerSubscriptionSetting = {
  body: Joi.object({
    policies: Joi.array()
      .items(
        Joi.object()
          .keys({
            outlet_id: Joi.string().trim().uuid().required(),
            machines: Joi.array()
              .items(
                Joi.object()
                  .keys({
                    machine_id: Joi.string().trim().uuid().required().messages({
                      'string.empty': `"machine id" cannot be an empty field`,
                      'any.required': `"machine id" is a required field`,
                    }),
                    security_deposited: Joi.number()
                      .required()
                      .min(0)
                      .messages({
                        'any.required': `"machine security deposited" is a required field`,
                      }),
                    billing_cycle: Joi.number().required().min(1).messages({
                      'any.required': `"machine billing cycle" is a required field`,
                    }),
                    invoice_date: Joi.number().min(1).required().messages({
                      'any.required': `"machine invoice date" is a required field`,
                    }),
                    minimum_wash_commitment: Joi.number()
                      .required()
                      .min(0)
                      .messages({
                        'any.required': `"machine minimum wash commitment" is a required field`,
                      }),
                    pricing_terms: Joi.array()
                      .items(
                        Joi.object()
                          .keys({
                            manpowerPricePerWash: Joi.number()
                              .min(0)
                              .default(0),
                            dealerPerWashPrice: Joi.number()
                              .min(0)
                              .messages({
                                'any.required': `"machine pricing terms dealer per wash price" is a required field`,
                              })
                              .required(),
                            type: Joi.string().trim().required(),
                          })
                          .required()
                      )
                      .required(),
                    taxable_amount: Joi.number().required().min(0).messages({
                      'any.required': `"machine taxable amount" is a required field`,
                    }),
                    cgst: Joi.number().required().min(0).messages({
                      'any.required': `"machine cgst" is a required field`,
                    }),
                    sgst: Joi.number().required().min(0).messages({
                      'any.required': `"machine sgst" is a required field`,
                    }),
                    total: Joi.number().required().min(0).messages({
                      'any.required': `"machine total" is a required field`,
                    }),
                  })
                  .required()
              )
              .required(),
          })
          .required()
      )
      .required(),
  }).required(),
};

const validateVerifyDealerKycOTPRequest = {
  body: Joi.object({
    email: Joi.string().trim().email().required(),
    otp: Joi.number().required(),
    app: Joi.string().trim().valid('DEALER', 'ADMIN').required(),
  }).required(),
};
export = {
  createDealerValidation: validateCreateDealerValidation,
  assignMachineToDealerOutlet: validateAssignMachineToDealerOutlet,
  updateDealerRequest: validateUpdateDealerRequest,
  validateDealerSubscriptionSetting,
  validateUpdateOutletAssignMachine,
  validateUpdateDealerSubscriptionSetting,
  validateVerifyDealerKycOTPRequest,
};
