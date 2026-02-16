import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import { StepService } from '../../components/step-service/step-service';
import { StepBarber } from '../../components/step-barber/step-barber';
import { StepDatetime } from '../../components/step-datetime/step-datetime';
import { StepConfirm } from '../../components/step-confirm/step-confirm';
import { AuthModal } from '../../components/auth-modal/auth-modal';

import { BookingState } from '../../models/booking-state.model';
import { BarberShopsApiService, BarberShopDto } from '../../../../core/services/barber-shops-api.service';
import { ServicesApiService, ServiceDto } from '../../../../core/services/services-api.service';
import { BarbersApiService, BarberDto } from '../../../../core/services/barbers-api.service';
import { AppointmentsApiService } from '../../../../core/services/appointments-api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    StepService,
    StepBarber,
    StepDatetime,
    StepConfirm,
    AuthModal,
  ],
  providers: [MessageService],
  templateUrl: './booking-wizard.html',
  styleUrl: './booking-wizard.scss',
})
export class BookingWizard implements OnInit {
  barberShopId: string = '';
  barberShop: BarberShopDto | null = null;
  services: ServiceDto[] = [];
  barbers: BarberDto[] = [];

  booking: BookingState = {
    service: null,
    barber: null,
    date: null,
    time: null,
  };

  loading = true;
  submitting = false;
  showAuthModal = false;
  authModalForConfirm = false; // true when showing modal at confirm step
  activeStep = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barberShopsApi: BarberShopsApiService,
    private servicesApi: ServicesApiService,
    private barbersApi: BarbersApiService,
    private appointmentsApi: AppointmentsApiService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.barberShopId = this.route.snapshot.paramMap.get('barberShopId') || '';

    // Check auth first
    if (!this.authService.isAuthenticated()) {
      this.showAuthModal = true;
      this.loading = false;
    } else {
      this.loadInitialData();
    }
  }

  loadInitialData() {
    this.loading = true;

    this.barberShopsApi.getById(this.barberShopId).subscribe({
      next: (shop) => {
        this.barberShop = shop;
        this.loadServices();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la barberia',
        });
        this.loading = false;
      },
    });
  }

  loadServices() {
    this.servicesApi.list(this.barberShopId).subscribe({
      next: (services) => {
        this.services = services;
        this.loadBarbers();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadBarbers() {
    this.barbersApi.list(this.barberShopId).subscribe({
      next: (barbers) => {
        this.barbers = barbers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onServiceSelected(service: ServiceDto) {
    this.booking.service = service;
    this.activeStep = 1;
  }

  onBarberSelected(barber: BarberDto) {
    this.booking.barber = barber;
    this.activeStep = 2;
  }

  onDateTimeSelected(event: { date: string; time: string }) {
    this.booking.date = event.date;
    this.booking.time = event.time;
    this.activeStep = 3;
  }

  goBack() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  confirmBooking() {
    if (!this.authService.isAuthenticated()) {
      this.authModalForConfirm = true;
      this.showAuthModal = true;
      return;
    }

    this.createAppointment();
  }

  onAuthenticated() {
    this.showAuthModal = false;

    if (this.authModalForConfirm) {
      // User authenticated at confirm step, create appointment
      this.authModalForConfirm = false;
      this.createAppointment();
    } else {
      // User authenticated at start, load data
      this.loadInitialData();
    }
  }

  onAuthModalHide() {
    // If user closes modal without authenticating at start, redirect to login
    if (!this.authService.isAuthenticated() && !this.authModalForConfirm) {
      this.router.navigateByUrl('/login');
    }
  }

  private createAppointment() {
    if (!this.booking.barber || !this.booking.service || !this.booking.date || !this.booking.time) {
      return;
    }

    this.submitting = true;

    const clientId = this.getClientIdFromToken();
    if (!clientId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el ID del cliente',
      });
      this.submitting = false;
      return;
    }

    const dto = {
      barberId: this.booking.barber.id,
      serviceId: this.booking.service.id,
      clientId: clientId,
      date: `${this.booking.date}T${this.booking.time}:00`,
    };

    this.appointmentsApi.create(dto).subscribe({
      next: () => {
        this.submitting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Reserva confirmada',
          detail: 'Tu cita ha sido agendada exitosamente',
        });
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo crear la cita',
        });
      },
    });
  }

  private getClientIdFromToken(): string | null {
    const token = this.authService.token;
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }

  canProceedToStep(step: number): boolean {
    switch (step) {
      case 1:
        return !!this.booking.service;
      case 2:
        return !!this.booking.barber;
      case 3:
        return !!this.booking.date && !!this.booking.time;
      default:
        return true;
    }
  }
}
