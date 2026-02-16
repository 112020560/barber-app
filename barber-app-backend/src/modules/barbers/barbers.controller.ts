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
import { BarbersService } from './barbers.service';
import { CreateBarberDto } from './dtos/create-barber.dto';
import { UpdateBarberDto } from './dtos/update-barber.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from 'src/common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('barbers')
export class BarbersController {
  constructor(private readonly service: BarbersService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post()
  create(@Body() dto: CreateBarberDto, @CurrentUser() user: JwtPayload) {
    // OWNER solo puede crear barberos en su propia barbería
    if (user.role === 'OWNER') {
      if (!user.barberShopId) {
        throw new ForbiddenException('Owner no tiene barbería asignada');
      }
      dto.barberShopId = user.barberShopId;
    }
    return this.service.create(dto);
  }

  // GET /barbers?barberShopId=uuid
  @Get()
  findAll(
    @Query('barberShopId') barberShopId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // OWNER siempre ve los barberos de su barbería
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
    @Body() dto: UpdateBarberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // OWNER solo puede editar barberos de su barbería
    if (user.role === 'OWNER') {
      const barber = await this.service.findOne(id);
      if (barber.barberShopId !== user.barberShopId) {
        throw new ForbiddenException('No puedes editar barberos de otra barbería');
      }
    }
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // OWNER solo puede eliminar barberos de su barbería
    if (user.role === 'OWNER') {
      const barber = await this.service.findOne(id);
      if (barber.barberShopId !== user.barberShopId) {
        throw new ForbiddenException('No puedes eliminar barberos de otra barbería');
      }
    }
    return this.service.remove(id);
  }
}
