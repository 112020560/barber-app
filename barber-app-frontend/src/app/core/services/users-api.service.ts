import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  barberShopId?: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  barberShopId?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  list(role?: string) {
    const q = role ? `?role=${role}` : '';
    return this.http.get<UserDto[]>(`${this.base}${q}`);
  }

  update(id: string, dto: UpdateUserDto) {
    return this.http.patch<UserDto>(`${this.base}/${id}`, dto);
  }

  create(dto: CreateUserDto) {
    return this.http.post<UserDto>(`${environment.apiUrl}/auth/register`, dto);
  }
}
