import { Module } from '@nestjs/common';
import { BarbersController } from './barbers.controller';
import { BarbersService } from './barbers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarberEntity } from './entities/barber.entity';
import { BarberWorkingHourEntity } from '../availability/entities/barber-working-hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BarberEntity, BarberWorkingHourEntity])],
  controllers: [BarbersController],
  providers: [BarbersService],
})
export class BarbersModule {}
