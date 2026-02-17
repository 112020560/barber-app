import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentEntity } from './entities/appointments.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { BarberEntity } from '../barbers/entities/barber.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ServiceEntity } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppointmentEntity,
      BarberEntity,
      UserEntity,
      ServiceEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
