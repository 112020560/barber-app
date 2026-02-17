export interface AppointmentCreatedEvent {
  appointmentId: string;
  barberId: string;
  barberUserId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  barberName: string;
  barberEmail: string;
  serviceName: string;
  shopName: string;
  date: Date;
}

export interface AppointmentConfirmedEvent {
  appointmentId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  barberName: string;
  serviceName: string;
  shopName: string;
  date: Date;
}

export interface AppointmentCancelledEvent {
  appointmentId: string;
  barberId: string;
  barberUserId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  barberName: string;
  barberEmail: string;
  serviceName: string;
  shopName: string;
  date: Date;
  cancelledBy: 'CLIENT' | 'BARBER' | 'OWNER';
}
