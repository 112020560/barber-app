import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateWorkingHourDto {
  @IsUUID()
  barberId: string;

  // 0=Sunday, 1=Monday, ..., 6=Saturday
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  // HH:MM format (e.g., "09:00")
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'lunchStart must be in HH:MM format',
  })
  lunchStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'lunchEnd must be in HH:MM format',
  })
  lunchEnd?: string;
}
