import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { GetAvailabilityDto } from './dtos/get-availability.dto';
import { CreateTimeBlockDto } from './dtos/create-time-block.dto';
import { GetTimeBlocksDto } from './dtos/get-time-blocks.dto';
import { UpdateWorkingHourDto } from './dtos/update-working-hour.dto';
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

  // =====================
  // TIME BLOCKS
  // =====================

  @Post('time-blocks')
  createTimeBlock(@Body() dto: CreateTimeBlockDto) {
    return this.service.createTimeBlock(dto);
  }

  @Get('time-blocks')
  getTimeBlocks(@Query() query: GetTimeBlocksDto) {
    return this.service.getTimeBlocks(query.barberId, query.from, query.to);
  }

  @Delete('time-blocks/:id')
  deleteTimeBlock(@Param('id') id: string) {
    return this.service.deleteTimeBlock(id);
  }

  // =====================
  // WORKING HOURS
  // =====================

  @Get('working-hours/:barberId')
  getWorkingHours(@Param('barberId') barberId: string) {
    return this.service.getWorkingHours(barberId);
  }

  @Patch('working-hours')
  updateWorkingHour(@Body() dto: UpdateWorkingHourDto) {
    return this.service.updateWorkingHour(dto);
  }
}
