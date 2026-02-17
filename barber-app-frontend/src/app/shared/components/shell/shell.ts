import { Component, computed, signal, OnInit, OnDestroy, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { Badge } from 'primeng/badge';
import { Popover } from 'primeng/popover';
import { Toast } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationsService } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-shell',
  imports: [
    CommonModule,
    RouterModule,
    PanelMenuModule,
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    Badge,
    Popover,
    Toast,
  ],
  providers: [MessageService],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  public notifications = inject(NotificationsService);
  private messageService = inject(MessageService);

  sidebarOpen = signal(false);

  // Menu for ADMIN
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
      label: 'Mi Horario',
      icon: 'pi pi-clock',
      routerLink: '/app/schedule',
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
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/app/dashboard',
      command: () => this.closeSidebar(),
    },
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

  // Notifications
  unreadCount = computed(() => this.notifications.unreadCount());
  notificationsList = computed(() => this.notifications.notifications());

  constructor() {
    // Show toast when new notification arrives
    effect(() => {
      const list = this.notificationsList();
      if (list.length > 0 && !list[0].read) {
        const latest = list[0];
        this.messageService.add({
          severity: this.getNotificationSeverity(latest.type),
          summary: latest.title,
          detail: latest.message,
          life: 5000,
        });
      }
    });
  }

  ngOnInit() {
    // Connect to SSE notifications
    this.notifications.connect();
    this.notifications.requestNotificationPermission();
  }

  ngOnDestroy() {
    this.notifications.disconnect();
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.notifications.disconnect();
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  markAllAsRead() {
    this.notifications.markAllAsRead();
  }

  private getNotificationSeverity(type: string): 'success' | 'info' | 'warn' | 'error' {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
        return 'success';
      case 'APPOINTMENT_CANCELLED':
        return 'error';
      case 'APPOINTMENT_CREATED':
        return 'info';
      default:
        return 'info';
    }
  }
}
