import { Joi } from 'express-validation';

export const validateAddWaterQuality = {
  body: Joi.object({
    machineId: Joi.string().uuid().required(),
    wasteType: Joi.string().required(),
    samplingDate: Joi.date().iso().required(),
    reportDate: Joi.date().iso().required(),
    tdsValue: Joi.number().required(),
    tssValue: Joi.number().required(),
    codValue: Joi.number().required(),
    bodValue: Joi.number().optional().allow(null),
    phValue: Joi.number().required(),
    oilGreaseValue: Joi.number().required(),
    washCountBetweenReports: Joi.number().required(),
    cummulativeWashCount: Joi.number().required(),
    labReportUrl: Joi.string().required(),
  }),
};
