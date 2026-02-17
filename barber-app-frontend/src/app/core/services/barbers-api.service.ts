import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface BarberDto {
  id: string;
  userId: string;
  barberShopId: string;
  createdAt: string;

  // si backend lo devuelve eager:
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateBarberDto {
  userId: string;
  barberShopId: string;
}

@Injectable({ providedIn: 'root' })
export class BarbersApiService {
  private base = `${environment.apiUrl}/barbers`;

  constructor(private http: HttpClient) {}

  list(barberShopId: string) {
    return this.http.get<BarberDto[]>(`${this.base}?barberShopId=${barberShopId}`);
  }

  getByUserId(userId: string) {
    return this.http.get<BarberDto>(`${this.base}/by-user/${userId}`);
  }

  create(dto: CreateBarberDto) {
    return this.http.post<BarberDto>(this.base, dto);
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
