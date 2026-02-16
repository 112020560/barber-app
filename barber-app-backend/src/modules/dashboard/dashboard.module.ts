import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserEntity } from '../users/entities/user.entity';
import { BarberShopEntity } from '../barber-shops/entities/barber-shop.entity';
import { BarberEntity } from '../barbers/entities/barber.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { AppointmentEntity } from '../appointments/entities/appointments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BarberShopEntity,
      BarberEntity,
      ServiceEntity,
      AppointmentEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
