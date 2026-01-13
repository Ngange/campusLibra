import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // backend supplies enum strings like 'borrow_confirmed'
  isRead: boolean;
  createdAt: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private socket: Socket;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  private lastScope: 'user' | 'role' | 'all' | undefined;

  constructor(private http: HttpClient, private ngZone: NgZone) {
    // Initialize Socket.IO connection
    const socketUrl = environment.socketUrl || environment.apiUrl?.replace(/\/api$/, '') || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      autoConnect: false,
      path: '/socket.io'
    });

    // Listen for new notifications
    this.socket.on('newNotification', (raw: any) => {
      // Ensure change detection runs for socket events
      this.ngZone.run(() => {
        const notification = this.normalize(raw);
        const currentNotifications = this.notificationsSubject.value;
        const newNotifications = [notification, ...currentNotifications];
        this.notificationsSubject.next(newNotifications);

        // Only increment if notification is not already read
        if (!notification.isRead) {
          this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        }
      });
    });

    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  loadInitialNotifications(): void {
    // Use backend defaults (admin -> all, others -> user)
    this.loadNotifications(undefined);
  }

  // Load notifications with optional scope: 'user' | 'role' | 'all'
  loadNotifications(scope: 'user' | 'role' | 'all' | undefined): void {
    this.lastScope = scope;
    const url = scope ? `${this.apiUrl}?scope=${scope}` : this.apiUrl;
    this.http.get<{ success: boolean; notifications: any[]; unreadCount: number; scope?: string }>(url)
      .subscribe({
        next: (response) => {
          const raw = Array.isArray(response.notifications) ? response.notifications : [];
          const notifications = raw.map((n) => this.normalize(n));
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(response.unreadCount ?? 0);
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
        }
      });
  }

  private normalize(n: any): Notification {
    const id = n._id || n.id;
    const userId = typeof n.userId === 'object' && n.userId !== null ? (n.userId._id || n.userId.id) : n.userId;
    return {
      id,
      userId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: !!n.isRead,
      createdAt: n.createdAt,
    };
  }

  connectUser(userId: string): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    this.socket.emit('joinUser', userId);
  }

  markAsRead(notificationId: string): void {
    // Persist read state to backend
    this.http.patch<{ success: boolean; unreadCount: number }>(`${this.apiUrl}/${notificationId}/read`, {})
      .subscribe({
        next: (res) => {
          if (typeof res.unreadCount === 'number') {
            this.unreadCountSubject.next(res.unreadCount);
          }
        },
        error: (error) => {
          console.error('Failed to mark notification as read:', error);
        }
      });

    // Update local state
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    );
    this.notificationsSubject.next(updatedNotifications);

    // Decrease unread count
    this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));

    // TODO: Call backend to mark as read
    // this.http.patch(`${environment.apiUrl}/notifications/${notificationId}/read`, {}).subscribe();
  }

  markAsUnread(notificationId: string): void {
    // Persist unread state to backend
    this.http.patch<{ success: boolean; unreadCount: number }>(`${this.apiUrl}/${notificationId}/unread`, {})
      .subscribe({
        next: (res) => {
          if (typeof res.unreadCount === 'number') {
            this.unreadCountSubject.next(res.unreadCount);
          }
        },
        error: (error) => {
          console.error('Failed to mark notification as unread:', error);
        }
      });

    // Update local state
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: false } : notif
    );
    this.notificationsSubject.next(updatedNotifications);

    // Increase unread count
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  markAllAsRead(): void {
    // For now, just clear locally. Could add backend endpoint if needed.
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notif => ({ ...notif, isRead: true }));
    this.notificationsSubject.next(updatedNotifications);
    this.unreadCountSubject.next(0);

    // TODO: Call backend to mark all as read
    // this.http.patch(`${environment.apiUrl}/notifications/read-all`, {}).subscribe();
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Method to clear notifications (e.g., on logout)
  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}
