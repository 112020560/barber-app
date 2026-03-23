import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface CreateAppointmentDto {
  barberId: string;
  serviceId: string;
  clientId: string;
  date: string; // ISO format: YYYY-MM-DDTHH:mm:ss
}

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

  // GET /appointments/barber/:barberId/week?from=YYYY-MM-DD
  getWeekAgenda(barberId: string, from: string) {
    return this.http.get<AppointmentDto[]>(`${this.base}/barber/${barberId}/week?from=${from}`);
  }

  updateStatus(id: string, status: AppointmentStatus) {
    return this.http.patch<AppointmentDto>(`${this.base}/${id}/status`, { status });
  }

  create(dto: CreateAppointmentDto) {
    return this.http.post<AppointmentDto>(this.base, dto);
  }
}
