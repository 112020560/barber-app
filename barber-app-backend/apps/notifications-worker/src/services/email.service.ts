import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { SendEmailPayload } from '@app/shared';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(payload: SendEmailPayload): Promise<void> {
    try {
      // If no API key, just log (for development)
      if (!process.env.RESEND_API_KEY) {
        console.log('📧 [DEV MODE] Email would be sent:', payload);
        return;
      }

      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'BarberApp <noreply@barberapp.com>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw - we don't want to fail the message processing
    }
  }
}
