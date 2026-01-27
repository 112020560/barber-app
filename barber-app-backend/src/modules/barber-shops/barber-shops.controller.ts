import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateBarberShopDto } from './dto/create-barber-shop.dto';
import { BarberShopsService } from './barber-shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('barber-shops')
export class BarberShopsController {
  constructor(private readonly service: BarberShopsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateBarberShopDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
