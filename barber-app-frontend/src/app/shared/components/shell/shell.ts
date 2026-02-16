import { Component, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from '../../../core/services/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-shell',
  imports: [
    RouterModule,
    PanelMenuModule,
    ToolbarModule,
    ButtonModule,
    AvatarModule,],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  sidebarOpen = signal(false);

  // Menu for ADMIN and BARBER
  adminMenu = computed<MenuItem[]>(() => [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/app/dashboard',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Barberías',
      icon: 'pi pi-building',
      routerLink: '/app/barber-shops',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Barberos',
      icon: 'pi pi-users',
      routerLink: '/app/barbers',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Servicios',
      icon: 'pi pi-briefcase',
      routerLink: '/app/services',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Citas',
      icon: 'pi pi-calendar',
      routerLink: '/app/appointments',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Usuarios',
      icon: 'pi pi-id-card',
      routerLink: '/app/users',
      command: () => this.closeSidebar(),
    },
  ]);

  // Menu for OWNER (solo su barbería)
  ownerMenu = computed<MenuItem[]>(() => [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/app/dashboard',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Barberos',
      icon: 'pi pi-users',
      routerLink: '/app/barbers',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Servicios',
      icon: 'pi pi-briefcase',
      routerLink: '/app/services',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Citas',
      icon: 'pi pi-calendar',
      routerLink: '/app/appointments',
      command: () => this.closeSidebar(),
    },
  ]);

  // Menu for BARBER (solo sus citas)
  barberMenu = computed<MenuItem[]>(() => [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/app/dashboard',
      command: () => this.closeSidebar(),
    },
    {
      label: 'Citas',
      icon: 'pi pi-calendar',
      routerLink: '/app/appointments',
      command: () => this.closeSidebar(),
    },
  ]);

  // Menu for CLIENT
  clientMenu = computed<MenuItem[]>(() => [
    {
      label: 'Reservar Cita',
      icon: 'pi pi-calendar-plus',
      routerLink: '/app/reservar',
      command: () => this.closeSidebar(),
    },
  ]);

  // Select menu based on role
  menu = computed<MenuItem[]>(() => {
    const role = this.auth.userRole();
    if (role === 'CLIENT') {
      return this.clientMenu();
    }
    if (role === 'OWNER') {
      return this.ownerMenu();
    }
    if (role === 'BARBER') {
      return this.barberMenu();
    }
    return this.adminMenu();
  });

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
