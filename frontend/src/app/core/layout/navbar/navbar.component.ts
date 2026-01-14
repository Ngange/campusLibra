import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser: any = null;
  currentUserId: string | null = null;
  userRole: string = 'member';
  unreadNotifications: number = 0;
  notifications$: Observable<Notification[]>;
  unreadNotifications$: Observable<Notification[]>;
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.notifications$ = this.notificationService.notifications$;
    // Show all unread notifications (scope may include role/all, not just user-owned)
    this.unreadNotifications$ = this.notifications$.pipe(
      map((notifications) => notifications.filter((n) => !n.isRead))
    );

    // Subscribe to unread notification count
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotifications = count;
    });

    // Close mobile menu when route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserId = this.currentUser ? (this.currentUser._id || (this.currentUser as any).id || null) : null;
    const rawRole = this.currentUser?.role;
    this.userRole = typeof rawRole === 'string' ? rawRole : rawRole?.name || rawRole?.role || 'member';
  }

  /**
   * Check if view is mobile (width <= 768px)
   */
  isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Toggle mobile menu state
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * Logout and close menu
   */
  logoutAndClose(): void {
    this.closeMobileMenu();
    this.logout();
  }

  /**
   * Navigate to role-specific dashboard
   */
  goToDashboard(): void {
    const role = this.userRole.toLowerCase();
    switch(role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'librarian':
        this.router.navigate(['/librarian-dashboard']);
        break;
      default:
        this.router.navigate(['/member-dashboard']);
        break;
    }
    this.closeMobileMenu();
  }

  /**
   * Handle window resize - close menu on desktop view
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (window.innerWidth > 768) {
      this.isMobileMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  markNotificationAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  getIconForType(type: string): string {
    const iconMap: { [key: string]: string } = {
      'info': 'info',
      'warning': 'warning',
      'success': 'check_circle',
      'error': 'error'
    };
    return iconMap[type] || 'notifications';
  }
}
