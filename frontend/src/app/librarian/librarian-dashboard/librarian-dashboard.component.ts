import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu } from '@angular/material/menu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-librarian-dashboard',
  templateUrl: './librarian-dashboard.component.html',
  styleUrls: ['./librarian-dashboard.component.scss']
})
export class LibrarianDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('returnsMenu') returnsMenu!: MatMenu;
  @ViewChild('pickupsMenu') pickupsMenu!: MatMenu;

  currentUser: any = null;
  stats: DashboardStats = {
    totalBooks: 0,
    issuedBooks: 0,
    reservedBooks: 0,
    overdueBooks: 0
  };

  pendingReturns: any[] = [];
  pendingPickups: any[] = [];
  currentYear = new Date().getFullYear();
  isLoadingReturns = true;
  isLoadingPickups = true;
  private dashboardSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
    this.loadPendingReturns();
    this.loadPendingPickups();

    // Connect to real-time dashboard updates
    this.dashboardService.connectDashboard(this.currentUser.id, 'librarian');

    // Subscribe to dashboard updates
    this.dashboardSubscription = this.dashboardService.dashboardUpdate$.subscribe(() => {
      console.log('Refreshing librarian dashboard due to update...');
      this.loadStats();
      this.loadPendingReturns();
      this.loadPendingPickups();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription and disconnect socket
    if (this.dashboardSubscription) {
      this.dashboardSubscription.unsubscribe();
    }
    this.dashboardService.disconnectDashboard();
  }

  loadStats(): void {
    this.dashboardService.getLibrarianStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load statistics.', 'Close', { duration: 5000 });
      }
    });
  }

  loadPendingReturns(): void {
    this.dashboardService.getPendingReturns().subscribe({
      next: (borrows) => {
        this.pendingReturns = borrows;
        this.isLoadingReturns = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load pending returns.', 'Close', { duration: 5000 });
        this.isLoadingReturns = false;
      }
    });
  }

  refresh(): void {
    this.loadStats();
    this.loadPendingReturns();
    this.loadPendingPickups();
    this.snackBar.open('Dashboard refreshed', 'Close', { duration: 2000 });
  }

  loadPendingPickups(): void {
    this.dashboardService.getPendingPickups().subscribe({
      next: (reservations) => {
        this.pendingPickups = reservations;
        this.isLoadingPickups = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load pending pickups.', 'Close', { duration: 5000 });
        this.isLoadingPickups = false;
      }
    });
  }

  processReturn(borrow: any): void {
    this.snackBar.open('Return processed successfully!', 'Close', { duration: 3000 });
    this.loadPendingReturns();
  }

  fulfillPickup(reservation: any): void {
    this.snackBar.open('Pickup fulfilled successfully!', 'Close', { duration: 3000 });
    this.loadPendingPickups();
  }

  viewDetails(item: any): void {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
