import { IsUUID } from 'class-validator';

export class CreateBarberDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  barberShopId: string;
}
