import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface BarberShopDto {
  id: string;
  name: string;
  address: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class BarberShopsApiService {
  private base = `${environment.apiUrl}/barber-shops`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<BarberShopDto[]>(this.base);
  }
}
