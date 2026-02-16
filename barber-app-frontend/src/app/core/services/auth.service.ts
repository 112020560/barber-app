import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'access_token';

export type UserRole = 'ADMIN' | 'OWNER' | 'BARBER' | 'CLIENT';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  barberShopId: string | null;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  isAuthenticated = computed(() => !!this._token());

  userRole = computed<UserRole | null>(() => {
    const payload = this.getTokenPayload();
    return payload?.role || null;
  });

  userId = computed<string | null>(() => {
    const payload = this.getTokenPayload();
    return payload?.sub || null;
  });

  barberShopId = computed<string | null>(() => {
    const payload = this.getTokenPayload();
    return payload?.barberShopId || null;
  });

  get token(): string | null {
    return this._token();
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }

  private getTokenPayload(): TokenPayload | null {
    const token = this._token();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
