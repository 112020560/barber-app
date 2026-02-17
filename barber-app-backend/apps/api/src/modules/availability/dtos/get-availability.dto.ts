import { IsDateString, IsUUID } from 'class-validator';

export class GetAvailabilityDto {
  @IsUUID()
  barberId: string;

  @IsUUID()
  serviceId: string;

  // YYYY-MM-DD
  @IsDateString()
  day: string;
}
