import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';
import { NotificationEntity } from './entities/notification.entity';
import { QUEUES } from '@app/shared';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://admin:Abc..123@localhost:5672/Barber-app-dev',
          ],
          queue: QUEUES.NOTIFICATIONS,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [NotificationsController, SseController],
  providers: [NotificationsService, SseService],
  exports: [NotificationsService, SseService],
})
export class NotificationsModule {}
