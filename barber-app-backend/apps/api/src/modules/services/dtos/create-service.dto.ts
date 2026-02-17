import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateServiceDto {
  @IsUUID()
  barberShopId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // lo recibimos como string para numeric
  @IsString()
  @IsNotEmpty()
  price: string;

  @IsInt()
  @Min(1)
  durationMin: number;
}
