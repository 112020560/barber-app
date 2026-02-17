import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsWorkerModule } from './notifications-worker.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsWorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'notifications',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log('Notifications Worker is listening...');
}
bootstrap();
