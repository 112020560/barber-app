import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EVENTS, NotificationPayload } from '@app/shared';
import { EmailService } from '../services/email.service';

@Controller()
export class NotificationsConsumer {
  constructor(private readonly emailService: EmailService) {}

  @MessagePattern(EVENTS.APPOINTMENT_CREATED)
  async handleAppointmentCreated(@Payload() data: NotificationPayload) {
    console.log('Received appointment.created event:', data);

    // Send email to barber
    await this.emailService.sendEmail({
      to: data.recipientEmail,
      subject: data.title,
      html: `
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        ${data.data ? `<p>Detalles: ${JSON.stringify(data.data)}</p>` : ''}
      `,
    });

    console.log('Email sent for appointment.created');
  }

  @MessagePattern(EVENTS.APPOINTMENT_CONFIRMED)
  async handleAppointmentConfirmed(@Payload() data: NotificationPayload) {
    console.log('Received appointment.confirmed event:', data);

    // Send email to client
    await this.emailService.sendEmail({
      to: data.recipientEmail,
      subject: data.title,
      html: `
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        ${data.data ? `<p>Detalles: ${JSON.stringify(data.data)}</p>` : ''}
      `,
    });

    console.log('Email sent for appointment.confirmed');
  }

  @MessagePattern(EVENTS.APPOINTMENT_CANCELLED)
  async handleAppointmentCancelled(@Payload() data: NotificationPayload) {
    console.log('Received appointment.cancelled event:', data);

    // Send email notification
    await this.emailService.sendEmail({
      to: data.recipientEmail,
      subject: data.title,
      html: `
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        ${data.data ? `<p>Detalles: ${JSON.stringify(data.data)}</p>` : ''}
      `,
    });

    console.log('Email sent for appointment.cancelled');
  }
}
