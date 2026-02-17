export type NotificationType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED';

export interface NotificationPayload {
  type: NotificationType;
  recipientId: string;
  recipientEmail: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}
