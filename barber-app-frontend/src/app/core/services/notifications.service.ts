import { Injectable, signal, computed, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

interface NotificationFromApi {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private eventSource: EventSource | null = null;
  private _notifications = signal<Notification[]>([]);
  private _connected = signal(false);

  notifications = this._notifications.asReadonly();
  connected = this._connected.asReadonly();

  unreadCount = computed(() =>
    this._notifications().filter((n) => !n.read).length
  );

  connect() {
    if (this.eventSource || !this.authService.token) {
      return;
    }

    // First, load existing notifications from API
    this.loadNotificationsFromApi();

    // Then connect to SSE for real-time updates
    const url = `${environment.apiUrl}/notifications/stream`;
    this.eventSource = new EventSource(`${url}?token=${this.authService.token}`);

    this.eventSource.onopen = () => {
      console.log('SSE connected');
      this._connected.set(true);
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);

        if (data.type === 'connected') {
          return;
        }

        // Add new notification (from real-time)
        const notification: Notification = {
          id: data.data?.notificationId || crypto.randomUUID(),
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data,
          read: false,
          createdAt: new Date(),
        };

        // Add to beginning, avoid duplicates
        this._notifications.update((notifications) => {
          const exists = notifications.some((n) => n.id === notification.id);
          if (exists) return notifications;
          return [notification, ...notifications];
        });

        // Show browser notification if supported
        this.showBrowserNotification(notification);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this._connected.set(false);

      setTimeout(() => {
        if (this.authService.isAuthenticated()) {
          this.disconnect();
          this.connect();
        }
      }, 5000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this._connected.set(false);
      console.log('SSE disconnected');
    }
  }

  private loadNotificationsFromApi() {
    this.http
      .get<NotificationFromApi[]>(`${environment.apiUrl}/notifications`)
      .subscribe({
        next: (notifications) => {
          const mapped: Notification[] = notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            data: n.data || undefined,
            read: n.read,
            createdAt: new Date(n.createdAt),
          }));
          this._notifications.set(mapped);
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
        },
      });
  }

  markAsRead(notificationId: string) {
    // Update locally first
    this._notifications.update((notifications) =>
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );

    // Then sync with API
    this.http
      .patch(`${environment.apiUrl}/notifications/${notificationId}/read`, {})
      .subscribe({
        error: (err) => console.error('Error marking as read:', err),
      });
  }

  markAllAsRead() {
    // Update locally first
    this._notifications.update((notifications) =>
      notifications.map((n) => ({ ...n, read: true }))
    );

    // Then sync with API
    this.http
      .patch(`${environment.apiUrl}/notifications/read-all`, {})
      .subscribe({
        error: (err) => console.error('Error marking all as read:', err),
      });
  }

  clearNotifications() {
    this._notifications.set([]);
  }

  private showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
      });
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
