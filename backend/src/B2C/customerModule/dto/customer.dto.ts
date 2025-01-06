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
  IsIn,
} from 'class-validator';

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

  @IsNotEmpty() // Ensure phone is not empty
  @IsString() // Ensure phone is a string
  phone: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other']) // Validate gender
  gender: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  stateId?: string;

  @IsOptional()
  cityId?: string;

  @IsOptional()
  @IsString()
  pincode?: string;
}
