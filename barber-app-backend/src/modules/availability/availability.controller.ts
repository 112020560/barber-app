import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { GetAvailabilityDto } from './dtos/get-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}

  @Get()
  get(@Query() query: GetAvailabilityDto) {
    return this.service.getAvailability(
      query.barberId,
      query.serviceId,
      query.day,
    );
  }
}
