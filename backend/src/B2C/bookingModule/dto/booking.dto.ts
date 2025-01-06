import { Joi } from 'express-validation';
import { VehicleType } from '../../models/vehicle';

export const createBookingDTO = {
  body: Joi.object({
    merchantId: Joi.string().required(),
    startDateTime: Joi.date().iso().min('now').required(), // Must be greater than current time
    endDateTime: Joi.date()
      .iso()
      .min('now')
      .greater(Joi.ref('startDateTime'))
      .required(), // Must be greater than current time and startDateTime,
    washTypeId: Joi.string().required(),
    waterSaved: Joi.number().required(),
    washPoints: Joi.number().required(),
    status: Joi.string().required(),
    remarks: Joi.string().allow('').optional(),
    vehicleId: Joi.string().required(),
    additionalServices: Joi.array()
      .items(
        Joi.object({
          additionalServiceId: Joi.string().required(),
          name: Joi.string().required(),
          price: Joi.number().required(),
        })
      )
      .optional(),
  }),
};

export const BookingPaymentDTO = {
  body: Joi.object({
    paymentAmount: Joi.number().required(),
    bookingId: Joi.string().required(),
    couponId: Joi.string().optional(),
    couponCode: Joi.string().optional(),
    couponAmount: Joi.number().optional(),
  }),
};

export const rescheduleBookingDTO = {
  body: Joi.object({
    merchantId: Joi.string().required(),
    startDateTime: Joi.date().iso().min('now').required(), // Must be greater than current time
    endDateTime: Joi.date()
      .iso()
      .min('now')
      .greater(Joi.ref('startDateTime'))
      .required(), // Must be greater than current time and startDateTime,
    bookingId: Joi.string().required(),
    vehicleId: Joi.string().required(),
  }),
};

export const BookingWashPaymentDTO = {
  body: Joi.object({
    bookingId: Joi.string().required(),
    washType: Joi.string().valid('gold', 'silver', 'platinum').required(),
    paymentAmount: Joi.number().optional(),
    vehicleType: Joi.string()
      .allow(VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER)
      .required(),
  }),
};
