import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

interface AuthResponse {
  accessToken: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    TabsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './auth-modal.html',
})
export class AuthModal {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() authenticated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  loading = false;
  error: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onHide() {
    this.visibleChange.emit(false);
    this.error = null;
    this.closed.emit();
  }

  submitLogin() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;

    this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, this.loginForm.value)
      .subscribe({
        next: (res) => {
          this.auth.setToken(res.accessToken);
          this.loading = false;
          this.authenticated.emit();
          this.visibleChange.emit(false);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al iniciar sesion';
        },
      });
  }

  submitRegister() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = null;

    const registerData = {
      ...this.registerForm.value,
      role: 'CLIENT',
    };

    this.http
      .post<RegisterResponse>(`${environment.apiUrl}/auth/register`, registerData)
      .subscribe({
        next: () => {
          // Auto-login after register
          this.http
            .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
              email: this.registerForm.value.email,
              password: this.registerForm.value.password,
            })
            .subscribe({
              next: (res) => {
                this.auth.setToken(res.accessToken);
                this.loading = false;
                this.authenticated.emit();
                this.visibleChange.emit(false);
              },
              error: () => {
                this.loading = false;
                this.error = 'Registro exitoso. Por favor inicia sesion.';
              },
            });
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al registrarse';
        },
      });
  }
}
