import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardApiService } from '../../../../core/services/dashboard-api.service';
import { OwnerStats } from '../../models/dashboard-stats.model';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, ProgressSpinnerModule],
  templateUrl: './owner-dashboard.html',
})
export class OwnerDashboard implements OnInit {
  stats = signal<OwnerStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  appointmentsByBarberChartData = computed(() => {
    const data = this.stats();
    if (!data) return null;
    return {
      labels: data.appointmentsByBarber.map((b) => b.barberName),
      datasets: [
        {
          label: 'Citas',
          data: data.appointmentsByBarber.map((b) => b.count),
          backgroundColor: '#66BB6A',
        },
      ],
    };
  });

  chartOptions = {
    plugins: {
      legend: { position: 'bottom' as const },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(private dashboardApi: DashboardApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.dashboardApi.getOwnerStats().subscribe({
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
}
