import { IsDateString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  barberId: string;

  @IsUUID()
  serviceId: string;

  @IsUUID()
  clientId: string;

  @IsDateString()
  date: string;
}
