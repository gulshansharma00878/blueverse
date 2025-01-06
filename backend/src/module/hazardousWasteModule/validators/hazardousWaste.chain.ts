import { Joi } from 'express-validation';

export const validateAddWasteCollection = {
  body: Joi.object({
    machineId: Joi.string().uuid().required(),
    wasteType: Joi.string().required(),
    cleaningDate: Joi.date().iso().required(),
    wasteBagDetail: Joi.array().required(),
    washCount: Joi.number().required(),
  }),
};

export const validateUpdateWasteCollection = {
  body: Joi.object({
    wasteBagDetail: Joi.array().required(),
  }),
};
export const validateAddWasteDisposal = {
  body: Joi.object({
    machineId: Joi.string().uuid().required(),
    wasteType: Joi.string().required(),
    desposingDate: Joi.date().iso().required(),
    totalWasteBagWeight: Joi.number().required(),
    formUrl: Joi.string().required(),
    collected_waste_weight: Joi.number().required(),
    remaining_collected_waste_weight: Joi.number().required(),
  }),
};

export const validateUpdatedWasteDisposal = {
  body: Joi.object({
    totalWasteBagWeight: Joi.number().required(),
    formUrl: Joi.string().required(),
    remaining_collected_waste_weight: Joi.number().required(),
  }),
};
