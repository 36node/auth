import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateMyPhoneDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  scope: string;

  @IsNotEmpty()
  @IsString()
  dialingPrefix: string;
}

export class UpdateMyEmailDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  scope: string;
}
