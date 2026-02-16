import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AvailabilityDto {
  slots: string[]; // Array of available time slots in HH:mm format
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
}
