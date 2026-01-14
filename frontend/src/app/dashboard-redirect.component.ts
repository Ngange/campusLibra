import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  template: '<span>Redirecting to your dashboard…</span>'
})
export class DashboardRedirectComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    // If not authenticated, send to login
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Normalize role whether it's a string or populated object
    const rawRole: any = (currentUser as any)?.role;
    const role: string =
      typeof rawRole === 'string'
        ? rawRole
        : rawRole?.name || rawRole?.role || 'member';

    switch (String(role || 'member').toLowerCase()) {
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
  }
}
