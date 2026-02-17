import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GetTimeBlocksDto {
  @IsUUID()
  barberId: string;

  // Optional: filter by date range
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
