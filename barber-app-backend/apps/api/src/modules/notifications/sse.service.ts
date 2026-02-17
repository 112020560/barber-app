import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface NotificationMessage {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class SseService {
  private clients = new Map<string, Subject<NotificationMessage>>();
  private broadcast$ = new Subject<NotificationMessage>();

  addClient(userId: string): Observable<MessageEvent> {
    // Create a subject for this client if not exists
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Subject<NotificationMessage>());
    }

    const clientSubject = this.clients.get(userId)!;

    // Merge client-specific and broadcast messages
    return new Observable<MessageEvent>((observer) => {
      // Send initial connection message
      observer.next({
        data: { type: 'connected', message: 'Connected to notifications' },
      } as MessageEvent);

      // Subscribe to client-specific messages
      const clientSub = clientSubject.subscribe((msg) => {
        observer.next({
          data: msg,
        } as MessageEvent);
      });

      // Subscribe to broadcast messages filtered for this user
      const broadcastSub = this.broadcast$
        .pipe(filter((msg) => msg.userId === userId || msg.userId === 'all'))
        .subscribe((msg) => {
          observer.next({
            data: msg,
          } as MessageEvent);
        });

      // Cleanup on disconnect
      return () => {
        clientSub.unsubscribe();
        broadcastSub.unsubscribe();
        this.clients.delete(userId);
        console.log(`Client ${userId} disconnected from SSE`);
      };
    });
  }

  sendToUser(userId: string, notification: Omit<NotificationMessage, 'userId'>) {
    const message: NotificationMessage = { ...notification, userId };

    // Try to send directly to client if connected
    const clientSubject = this.clients.get(userId);
    if (clientSubject) {
      clientSubject.next(message);
      console.log(`Sent notification to user ${userId}`);
    } else {
      // Client not connected, could store for later or just log
      console.log(`User ${userId} not connected, notification not delivered in real-time`);
    }
  }

  broadcastToAll(notification: Omit<NotificationMessage, 'userId'>) {
    const message: NotificationMessage = { ...notification, userId: 'all' };
    this.broadcast$.next(message);
  }

  isClientConnected(userId: string): boolean {
    return this.clients.has(userId);
  }

  getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }
}
