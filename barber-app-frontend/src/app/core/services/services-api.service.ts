import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ServiceDto {
  id: string;
  barberShopId: string;
  name: string;
  price: string;
  durationMin: number;
  createdAt: string;
}

export interface CreateServiceDto {
  barberShopId: string;
  name: string;
  price: string;
  durationMin: number;
}

export interface UpdateServiceDto {
  barberShopId?: string;
  name?: string;
  price?: string;
  durationMin?: number;
}

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private base = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  list(barberShopId: string) {
    return this.http.get<ServiceDto[]>(`${this.base}?barberShopId=${barberShopId}`);
  }

  create(dto: CreateServiceDto) {
    return this.http.post<ServiceDto>(this.base, dto);
  }

  update(id: string, dto: UpdateServiceDto) {
    return this.http.patch<ServiceDto>(`${this.base}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
