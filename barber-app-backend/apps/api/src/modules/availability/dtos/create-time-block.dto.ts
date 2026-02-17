import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTimeBlockDto {
  @IsUUID()
  barberId: string;

  // ISO 8601 datetime (e.g., "2024-02-20T09:00:00")
  @IsDateString()
  startAt: string;

  // ISO 8601 datetime (e.g., "2024-02-20T12:00:00")
  @IsDateString()
  endAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
