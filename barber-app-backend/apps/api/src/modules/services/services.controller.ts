import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post()
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: JwtPayload) {
    // OWNER solo puede crear servicios en su propia barbería
    if (user.role === 'OWNER') {
      if (!user.barberShopId) {
        throw new ForbiddenException('Owner no tiene barbería asignada');
      }
      dto.barberShopId = user.barberShopId;
    }
    return this.service.create(dto);
  }

  // GET /services?barberShopId=uuid
  @Get()
  findAll(
    @Query('barberShopId') barberShopId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // OWNER siempre ve los servicios de su barbería
    if (user.role === 'OWNER' && user.barberShopId) {
      return this.service.findAllByBarberShop(user.barberShopId);
    }
    return this.service.findAllByBarberShop(barberShopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // OWNER solo puede editar servicios de su barbería
    if (user.role === 'OWNER') {
      const serviceEntity = await this.service.findOne(id);
      if (serviceEntity.barberShopId !== user.barberShopId) {
        throw new ForbiddenException('No puedes editar servicios de otra barbería');
      }
    }
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // OWNER solo puede eliminar servicios de su barbería
    if (user.role === 'OWNER') {
      const serviceEntity = await this.service.findOne(id);
      if (serviceEntity.barberShopId !== user.barberShopId) {
        throw new ForbiddenException('No puedes eliminar servicios de otra barbería');
      }
    }
    return this.service.remove(id);
  }
}
