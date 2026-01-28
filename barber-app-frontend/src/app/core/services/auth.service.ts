import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  isAuthenticated = computed(() => !!this._token());

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
}
