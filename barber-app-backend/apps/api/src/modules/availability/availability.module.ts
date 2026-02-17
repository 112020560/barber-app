import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarberWorkingHourEntity } from './entities/barber-working-hour.entity';
import { BarberTimeBlockEntity } from './entities/barber-time-block.entity';
import { AppointmentEntity } from '../appointments/entities/appointments.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BarberWorkingHourEntity,
      BarberTimeBlockEntity,
      AppointmentEntity,
      ServiceEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
