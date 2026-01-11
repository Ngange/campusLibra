import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification, NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {
    // Ensure notifications are loaded when navigating directly
    this.notificationService.loadInitialNotifications();
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }
}
