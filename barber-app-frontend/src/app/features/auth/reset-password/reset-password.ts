import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordModule, ButtonModule, CardModule, MessageModule],
  templateUrl: './reset-password.html',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  token = signal<string | null>(null);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error.set('Enlace inválido. Solicita uno nuevo.');
    } else {
      this.token.set(token);
    }
  }

  submit() {
    if (this.form.invalid || !this.token()) return;

    const { newPassword, confirmPassword } = this.form.value;

    if (newPassword !== confirmPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, {
        token: this.token(),
        newPassword,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], {
            queryParams: { reset: 'ok' },
          });
        },
        error: (err) => {
          this.error.set(err.error?.message || 'El enlace es inválido o ha expirado.');
          this.loading.set(false);
        },
      });
  }
}
