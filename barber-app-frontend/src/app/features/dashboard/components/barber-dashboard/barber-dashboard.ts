import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardApiService } from '../../../../core/services/dashboard-api.service';
import { BarberStats } from '../../models/dashboard-stats.model';

@Component({
  selector: 'app-barber-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, ProgressSpinnerModule],
  templateUrl: './barber-dashboard.html',
})
export class BarberDashboard implements OnInit {
  stats = signal<BarberStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private dashboardApi: DashboardApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.dashboardApi.getBarberStats().subscribe({
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
}
