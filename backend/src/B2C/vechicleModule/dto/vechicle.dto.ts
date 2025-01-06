import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDate,
  IsArray,
} from 'class-validator';

import Joi from 'joi';
import { VehicleType } from '../../models/vehicle';
export class CreateVehicleDTO {
  @IsNotEmpty()
  @IsString()
  hsrpNumber: string;

  @IsNotEmpty()
  @IsString()
  manufacturer: string;

  @IsNotEmpty()
  @IsString()
  vehicleModel: string;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsString()
  vehicleType: string;
}

export const createVehicleSchema = {
  body: Joi.object({
    hsrpNumber: Joi.string().required(),
    manufacturer: Joi.string().required(),
    vehicleModel: Joi.string().required(),
    imageUrl: Joi.string().optional(),
    vehicleType: Joi.string()
      .valid(VehicleType.FOUR_WHEELER, VehicleType.TWO_WHEELER)
      .required(),
  }),
};
