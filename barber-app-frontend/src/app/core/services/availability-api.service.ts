import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AvailabilityDto {
  slots: string[];
}

export interface WorkingHourDto {
  id: string;
  barberId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // HH:MM:SS
  endTime: string;
  isClosed: boolean;
  lunchStart?: string;
  lunchEnd?: string;
}

export interface TimeBlockDto {
  id: string;
  barberId: string;
  startAt: string; // ISO datetime
  endAt: string;
  reason?: string;
  createdAt: string;
}

export interface CreateTimeBlockDto {
  barberId: string;
  startAt: string;
  endAt: string;
  reason?: string;
}

export interface UpdateWorkingHourDto {
  barberId: string;
  dayOfWeek: number;
  startTime?: string; // HH:MM
  endTime?: string;
  isClosed?: boolean;
  lunchStart?: string;
  lunchEnd?: string;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityApiService {
  private base = `${environment.apiUrl}/availability`;

  constructor(private http: HttpClient) {}

  getSlots(barberId: string, serviceId: string, day: string) {
    return this.http.get<AvailabilityDto>(
      `${this.base}?barberId=${barberId}&serviceId=${serviceId}&day=${day}`
    );
  }

  // Working Hours
  getWorkingHours(barberId: string) {
    return this.http.get<WorkingHourDto[]>(
      `${this.base}/working-hours/${barberId}`
    );
  }

  updateWorkingHour(dto: UpdateWorkingHourDto) {
    return this.http.patch<WorkingHourDto>(`${this.base}/working-hours`, dto);
  }

  // Time Blocks
  getTimeBlocks(barberId: string, from?: string, to?: string) {
    let url = `${this.base}/time-blocks?barberId=${barberId}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    return this.http.get<TimeBlockDto[]>(url);
  }

  createTimeBlock(dto: CreateTimeBlockDto) {
    return this.http.post<TimeBlockDto & { cancelledAppointments: number }>(
      `${this.base}/time-blocks`,
      dto
    );
  }

  deleteTimeBlock(id: string) {
    return this.http.delete<{ deleted: boolean }>(
      `${this.base}/time-blocks/${id}`
    );
  }
}
