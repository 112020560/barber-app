import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardApiService } from '../../../../core/services/dashboard-api.service';
import { AdminStats } from '../../models/dashboard-stats.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, ProgressSpinnerModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  stats = signal<AdminStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  usersByRoleChartData = computed(() => {
    const data = this.stats();
    if (!data) return null;
    return {
      labels: data.usersByRole.map((u) => u.role),
      datasets: [
        {
          data: data.usersByRole.map((u) => u.count),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
        },
      ],
    };
  });

  appointmentsByShopChartData = computed(() => {
    const data = this.stats();
    if (!data) return null;
    return {
      labels: data.appointmentsByShop.map((s) => s.shopName),
      datasets: [
        {
          label: 'Citas',
          data: data.appointmentsByShop.map((s) => s.count),
          backgroundColor: '#42A5F5',
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
    this.dashboardApi.getAdminStats().subscribe({
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
