import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputTextModule, ButtonModule, CardModule, MessageModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, this.form.value)
      .subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Ocurrió un error. Intenta de nuevo.');
          this.loading.set(false);
        },
      });
  }
}
