import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBarberShopDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;
}
