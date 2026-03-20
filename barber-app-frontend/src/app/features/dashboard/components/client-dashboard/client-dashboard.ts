import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DashboardApiService } from '../../../../core/services/dashboard-api.service';
import { AppointmentsApiService } from '../../../../core/services/appointments-api.service';
import { ClientStats } from '../../models/dashboard-stats.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, ProgressSpinnerModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard implements OnInit {
  stats = signal<ClientStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private dashboardApi: DashboardApiService,
    private appointmentsApi: AppointmentsApiService,
    private msg: MessageService,
    private confirm: ConfirmationService,
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.dashboardApi.getClientStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar estadísticas');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  cancelAppointment(id: string): void {
    this.confirm.confirm({
      header: 'Cancelar cita',
      message: '¿Seguro que deseas cancelar esta cita?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.appointmentsApi.updateStatus(id, 'CANCELLED').subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'OK', detail: 'Cita cancelada correctamente' });
            this.loadStats();
          },
          error: () => {
            this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la cita' });
          },
        });
      },
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warn';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  }
}
