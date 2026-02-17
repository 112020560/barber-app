import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import {
  EVENTS,
  AppointmentCreatedEvent,
  AppointmentConfirmedEvent,
  AppointmentCancelledEvent,
  NotificationPayload,
} from '@app/shared';
import { SseService } from './sse.service';
import {
  NotificationEntity,
  NotificationType,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @Inject('NOTIFICATIONS_SERVICE') private readonly client: ClientProxy,
    private readonly sseService: SseService,
  ) {}

  // ============ Database Operations ============

  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    return this.notificationRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 notifications
    });
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepo.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.notificationRepo.update(
      { id: notificationId, userId },
      { read: true },
    );
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId, read: false }, { read: true });
    return { success: true };
  }

  private async saveNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepo.create({
      userId,
      type,
      title,
      message,
      data: data || null,
      read: false,
    });
    return this.notificationRepo.save(notification);
  }

  // ============ Event Notifications ============

  async notifyAppointmentCreated(event: AppointmentCreatedEvent) {
    const payload: NotificationPayload = {
      type: 'APPOINTMENT_CREATED',
      recipientId: event.barberUserId,
      recipientEmail: event.barberEmail,
      title: 'Nueva cita agendada',
      message: `${event.clientName} ha agendado una cita para ${event.serviceName} el ${new Date(event.date).toLocaleString('es-ES')}.`,
      data: {
        appointmentId: event.appointmentId,
        clientName: event.clientName,
        serviceName: event.serviceName,
        shopName: event.shopName,
        date: event.date,
      },
    };

    // Save to database
    const saved = await this.saveNotification(
      event.barberUserId,
      'APPOINTMENT_CREATED',
      payload.title,
      payload.message,
      payload.data,
    );

    // Send to RabbitMQ for email processing
    this.client.emit(EVENTS.APPOINTMENT_CREATED, payload);
    console.log('Emitted appointment.created event to RabbitMQ');

    // Send real-time notification via SSE (include the DB id)
    this.sseService.sendToUser(event.barberUserId, {
      type: 'APPOINTMENT_CREATED',
      title: payload.title,
      message: payload.message,
      data: { ...payload.data, notificationId: saved.id },
    });
  }

  async notifyAppointmentConfirmed(event: AppointmentConfirmedEvent) {
    const payload: NotificationPayload = {
      type: 'APPOINTMENT_CONFIRMED',
      recipientId: event.clientId,
      recipientEmail: event.clientEmail,
      title: 'Cita confirmada',
      message: `Tu cita con ${event.barberName} para ${event.serviceName} el ${new Date(event.date).toLocaleString('es-ES')} ha sido confirmada.`,
      data: {
        appointmentId: event.appointmentId,
        barberName: event.barberName,
        serviceName: event.serviceName,
        shopName: event.shopName,
        date: event.date,
      },
    };

    // Save to database
    const saved = await this.saveNotification(
      event.clientId,
      'APPOINTMENT_CONFIRMED',
      payload.title,
      payload.message,
      payload.data,
    );

    // Send to RabbitMQ for email processing
    this.client.emit(EVENTS.APPOINTMENT_CONFIRMED, payload);
    console.log('Emitted appointment.confirmed event to RabbitMQ');

    // Send real-time notification via SSE
    this.sseService.sendToUser(event.clientId, {
      type: 'APPOINTMENT_CONFIRMED',
      title: payload.title,
      message: payload.message,
      data: { ...payload.data, notificationId: saved.id },
    });
  }

  async notifyAppointmentCancelled(event: AppointmentCancelledEvent) {
    const recipientId =
      event.cancelledBy === 'CLIENT' ? event.barberUserId : event.clientId;
    const recipientEmail =
      event.cancelledBy === 'CLIENT' ? event.barberEmail : event.clientEmail;
    const cancelledByName =
      event.cancelledBy === 'CLIENT' ? event.clientName : event.barberName;

    const payload: NotificationPayload = {
      type: 'APPOINTMENT_CANCELLED',
      recipientId,
      recipientEmail,
      title: 'Cita cancelada',
      message: `La cita para ${event.serviceName} el ${new Date(event.date).toLocaleString('es-ES')} ha sido cancelada por ${cancelledByName}.`,
      data: {
        appointmentId: event.appointmentId,
        serviceName: event.serviceName,
        shopName: event.shopName,
        date: event.date,
        cancelledBy: event.cancelledBy,
      },
    };

    // Save to database
    const saved = await this.saveNotification(
      recipientId,
      'APPOINTMENT_CANCELLED',
      payload.title,
      payload.message,
      payload.data,
    );

    // Send to RabbitMQ for email processing
    this.client.emit(EVENTS.APPOINTMENT_CANCELLED, payload);
    console.log('Emitted appointment.cancelled event to RabbitMQ');

    // Send real-time notification via SSE
    this.sseService.sendToUser(recipientId, {
      type: 'APPOINTMENT_CANCELLED',
      title: payload.title,
      message: payload.message,
      data: { ...payload.data, notificationId: saved.id },
    });
  }
}
