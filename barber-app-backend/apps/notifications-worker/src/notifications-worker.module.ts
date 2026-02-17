import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsConsumer } from './consumers/notifications.consumer';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [NotificationsConsumer],
  providers: [EmailService],
})
export class NotificationsWorkerModule {}
