import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterClientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
