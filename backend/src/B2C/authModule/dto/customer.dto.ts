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

import { Joi } from 'express-validation';

export class CustomerDTO {
  @IsUUID()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsNotEmpty()
  @IsNumber()
  totalWaterSaved: number;

  @IsNotEmpty()
  @IsArray()
  badges: object[];

  @IsNotEmpty()
  @IsNumber()
  totalPoints: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @IsOptional()
  @IsUUID()
  deletedBy?: string;
}

export class CreateCustomerDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateCustomerDTO {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class SendOtpDTO {
  @IsNotEmpty()
  @IsString()
  phone?: string;
}

export class VerifyOtpDTO {
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  verification_code?: string;

  @IsOptional()
  referralCode: string;
}

export class CustomerUpdateDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  city: string;


  @IsNotEmpty()
  @IsString()
  state: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export const socialValidation = {
  body: Joi.object({
    email: Joi.string().trim().email().optional(),
    auth_token: Joi.string().trim().required(),
    unique_key: Joi.string().trim().optional(),
    deviceToken: Joi.string().allow('').optional(),
    provider:Joi.string().valid('google','apple').required(),
    referralCode:Joi.string().optional()
  }),
};