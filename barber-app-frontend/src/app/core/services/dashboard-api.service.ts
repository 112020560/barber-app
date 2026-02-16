import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  AdminStats,
  OwnerStats,
  BarberStats,
  ClientStats,
} from '../../features/dashboard/models/dashboard-stats.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private base = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getAdminStats() {
    return this.http.get<AdminStats>(`${this.base}/admin`);
  }

  getOwnerStats() {
    return this.http.get<OwnerStats>(`${this.base}/owner`);
  }

  getBarberStats() {
    return this.http.get<BarberStats>(`${this.base}/barber`);
  }

  getClientStats() {
    return this.http.get<ClientStats>(`${this.base}/client`);
  }
}
