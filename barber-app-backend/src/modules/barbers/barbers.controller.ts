import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BarbersService } from './barbers.service';
import { CreateBarberDto } from './dtos/create-barber.dto';
import { UpdateBarberDto } from './dtos/update-barber.dto';

@Controller('barbers')
export class BarbersController {
  constructor(private readonly service: BarbersService) {}

  @Post()
  create(@Body() dto: CreateBarberDto) {
    return this.service.create(dto);
  }

  // GET /barbers?barberShopId=uuid
  @Get()
  findAll(@Query('barberShopId') barberShopId: string) {
    return this.service.findAllByBarberShop(barberShopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBarberDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
