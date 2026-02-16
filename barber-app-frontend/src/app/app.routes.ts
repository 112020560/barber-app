import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { Shell } from './shared/components/shell/shell';
import { authGuard } from './core/guards/auth.guard';
import { Dashboard } from './features/dashboard/dashboard';
import { BarberShopsPage } from './features/barber-shops/pages/barber-shops-page/barber-shops-page';
import { BarbersPage } from './features/barbers/pages/barbers-page/barbers-page';
import { ServicesPage } from './features/services/pages/services-page/services-page';
import { AppointmentsPage } from './features/appointments/pages/appointments-page/appointments-page';
import { UsersPage } from './features/users/pages/users-page/users-page';
import { BookingWizard } from './features/booking/pages/booking-wizard/booking-wizard';
import { ClientHome } from './features/client/client-home';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'reservar/:barberShopId', component: BookingWizard },

  {
    path: 'app',
    component: Shell,
    canActivate: [authGuard],
    children: [
      // Admin/Barber routes
      { path: 'dashboard', component: Dashboard },
      { path: 'barber-shops', component: BarberShopsPage },
      { path: 'barbers', component: BarbersPage },
      { path: 'services', component: ServicesPage },
      { path: 'appointments', component: AppointmentsPage },
      { path: 'users', component: UsersPage },
      // Client routes
      { path: 'reservar', component: ClientHome },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
