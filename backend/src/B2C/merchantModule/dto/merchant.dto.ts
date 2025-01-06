import { Joi } from 'express-validation';
import { VehicleType } from '../../models/vehicle';
// Schema for new pricing terms
const newPricingTermsSchema = Joi.object({
  washTypeId: Joi.string().guid().required(), // ID of wash type
  washPrice: Joi.number().precision(2).required(), // Price for wash
  manPowerPrice: Joi.number().precision(2).required(), // Price for manpower
  // cgstPercentage: Joi.number().precision(2).required(), // CGST percentage
  // sgstPercentage: Joi.number().precision(2).required(), // SGST percentage
  totalPrice: Joi.number().precision(2).optional(), // Total price
  servicesOffered: Joi.string().trim().required(), // Services offered
});

// Schema for new additional services
const newAdditionalServicesSchema = Joi.object({
  additionalServiceId: Joi.string().guid().required(), // ID of additional service
  price: Joi.number().precision(2).required(), // Price of additional service
});

const machineAgentsSchema = Joi.object({
  machineId: Joi.string().guid().required(),
  agentIds: Joi.array().items(Joi.string().guid()).min(1).required(),
});

// Schema for new merchant
export const newMerchant = {
  body: Joi.object({
    bannerImageUrl: Joi.string().required(), // URL of banner image
    outletName: Joi.string().required(), // Name of outlet
    address: Joi.string().required(), // Address of outlet
    latitude: Joi.number().required(), // Latitude coordinate
    longitude: Joi.number().required(), // Longitude coordinate
    operationStartTime: Joi.string().required(), // Start time of operation
    operationEndTime: Joi.string().required(), // End time of operation
    runningStartTime: Joi.string().required(), // Start time of running
    runningEndTime: Joi.string().required(), // End time of running
    closingStartTime: Joi.date().iso().optional(), // Start time of running
    closingEndTime: Joi.date().iso().optional(),
    pricingTerms: Joi.array().items(newPricingTermsSchema).min(1).required(), // Pricing terms
    machineAgents: Joi.array().items(machineAgentsSchema).min(1).required(),
    additionalServices: Joi.array()
      .items(newAdditionalServicesSchema)
      .optional(), // Additional services offered,
    holidays: Joi.array().items(Joi.string().guid()).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    vehicleType: Joi.string()
      .allow(VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER)
      .required(),
    cityId: Joi.string().guid().required(),
  }),
};

export const updateMerchant = {
  body: Joi.object({
    bannerImageUrl: Joi.string().optional(), // URL of banner image
    outletName: Joi.string().optional(), // Name of outlet
    address: Joi.string().optional(), // Address of outlet
    latitude: Joi.number().optional(), // Latitude coordinate
    longitude: Joi.number().optional(), // Longitude coordinate
    operationStartTime: Joi.string().optional(), // Start time of operation
    operationEndTime: Joi.string().optional(), // End time of operation
    runningStartTime: Joi.string().optional(), // Start time of running
    runningEndTime: Joi.string().optional(), // End time of running
    closingStartTime: Joi.date().iso().optional(), // Start time of running
    closingEndTime: Joi.date().iso().optional(),
    pricingTerms: Joi.array().items(newPricingTermsSchema).optional(), // Pricing terms
    machineAgents: Joi.array().items(machineAgentsSchema).optional(),
    additionalServices: Joi.array()
      .items(newAdditionalServicesSchema)
      .min(1)
      .optional(), // Additional services offered,
    holidays: Joi.array().items(Joi.string().guid()).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    vehicleType: Joi.string()
      .allow(VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER)
      .optional(),
    cityId: Joi.string().guid().optional(),
  }),
};

export const merchantStatus = {
  body: Joi.object({
    isActive: Joi.boolean().required(), // URL of banner image
  }),
};

export const merchanImageAdd = {
  body: Joi.object({
    merchantId: Joi.string().guid().required(), // URL of banner image,
    images: Joi.array().items(Joi.string()).min(1).required(),
  }),
};
