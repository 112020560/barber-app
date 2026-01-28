import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface AppointmentDto {
  id: string;
  barberId: string;
  serviceId: string;
  clientId: string;
  date: string;
  status: AppointmentStatus;
  createdAt: string;

  // opcional si backend luego expande relations
  service?: { id: string; name: string; durationMin: number; price: string };
  client?: { id: string; name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AppointmentsApiService {
  private base = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  // GET /appointments/barber/:barberId?day=YYYY-MM-DD
  getAgenda(barberId: string, day: string) {
    return this.http.get<AppointmentDto[]>(`${this.base}/barber/${barberId}?day=${day}`);
  }

  updateStatus(id: string, status: AppointmentStatus) {
    return this.http.patch<AppointmentDto>(`${this.base}/${id}/status`, { status });
  }
}
