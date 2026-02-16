import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { OwnerDashboard } from './components/owner-dashboard/owner-dashboard';
import { BarberDashboard } from './components/barber-dashboard/barber-dashboard';
import { ClientDashboard } from './components/client-dashboard/client-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminDashboard, OwnerDashboard, BarberDashboard, ClientDashboard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private authService = inject(AuthService);

  userRole = computed(() => this.authService.userRole());
}
