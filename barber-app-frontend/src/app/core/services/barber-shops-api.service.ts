import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface BarberShopDto {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface CreateBarberShopDto {
  name: string;
  address: string;
  phone: string;
}

export interface UpdateBarberShopDto {
  name?: string;
  address?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class BarberShopsApiService {
  private base = `${environment.apiUrl}/barber-shops`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<BarberShopDto[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<BarberShopDto>(`${this.base}/${id}`);
  }

  create(dto: CreateBarberShopDto) {
    return this.http.post<BarberShopDto>(this.base, dto);
  }

  update(id: string, dto: UpdateBarberShopDto) {
    return this.http.patch<BarberShopDto>(`${this.base}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
