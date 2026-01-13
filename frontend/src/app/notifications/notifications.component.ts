import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification, NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<Notification[]>;
  currentUserId: string | null = null;
  role: string | null = null;
  scope: 'user' | 'role' | 'all' = 'user';

  constructor(private notificationService: NotificationService, private authService: AuthService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {
    // Ensure notifications are loaded when navigating directly
    const user = this.authService.getCurrentUser();
    this.currentUserId = user ? (user._id || (user as any).id || null) : null;
    const rawRole: any = user ? (user as any).role : null;
    const roleName: string | null = typeof rawRole === 'string' ? rawRole : (rawRole && rawRole.name) ? rawRole.name : null;
    this.role = roleName;
    // Set default scope based on role: admin -> all, librarian -> role, member -> user
    if (roleName === 'admin') {
      this.scope = 'all';
    } else if (roleName === 'librarian') {
      this.scope = 'role';
    } else {
      this.scope = 'user';
    }
    // If role unknown, use backend default by passing undefined
    this.notificationService.loadNotifications(roleName ? this.scope : undefined);
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAsUnread(notificationId: string): void {
    this.notificationService.markAsUnread(notificationId);
  }

  onScopeChange(scope: 'user' | 'role' | 'all'): void {
    this.scope = scope;
    this.notificationService.loadNotifications(scope);
  }
}
