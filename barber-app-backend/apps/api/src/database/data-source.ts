import { BarberWorkingHourEntity } from './../modules/availability/entities/barber-working-hour.entity';
import { BarberTimeBlockEntity } from './../modules/availability/entities/barber-time-block.entity';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { UserEntity } from '../modules/users/entities/user.entity';
import { BarberShopEntity } from '../modules/barber-shops/entities/barber-shop.entity';
import { BarberEntity } from '../modules/barbers/entities/barber.entity';
import { ServiceEntity } from '../modules/services/entities/service.entity';
import { AppointmentEntity } from '../modules/appointments/entities/appointments.entity';
import { NotificationEntity } from '../modules/notifications/entities/notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,

  ssl: { rejectUnauthorized: false },
  extra: { ssl: { rejectUnauthorized: false } },

  entities: [
    UserEntity,
    BarberShopEntity,
    BarberEntity,
    ServiceEntity,
    AppointmentEntity,
    BarberTimeBlockEntity,
    BarberWorkingHourEntity,
    NotificationEntity,
  ],
  migrations: ['dist/apps/api/database/migrations/*.js'],
});
