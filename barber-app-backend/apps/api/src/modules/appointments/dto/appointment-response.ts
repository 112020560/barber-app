export interface AppointmentResponse {
  id: string;
  barberId: string;
  barber: string;
  serviceId: string;
  service: string;
  clientId: string;
  cliente: string;
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
