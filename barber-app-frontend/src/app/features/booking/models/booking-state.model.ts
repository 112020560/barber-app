import { ServiceDto } from '../../../core/services/services-api.service';
import { BarberDto } from '../../../core/services/barbers-api.service';

export interface BookingState {
  service: ServiceDto | null;
  barber: BarberDto | null;
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:mm
}
