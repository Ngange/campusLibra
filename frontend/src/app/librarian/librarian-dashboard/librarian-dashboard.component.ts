import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-librarian-dashboard',
  templateUrl: './librarian-dashboard.component.html',
  styleUrls: ['./librarian-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibrarianDashboardComponent implements OnInit {
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
    console.log('Processing return:', borrow._id);
    this.snackBar.open('Return processed successfully!', 'Close', { duration: 3000 });
    this.loadPendingReturns();
  }

  fulfillPickup(reservation: any): void {
    console.log('Fulfilling pickup:', reservation._id);
    this.snackBar.open('Pickup fulfilled successfully!', 'Close', { duration: 3000 });
    this.loadPendingPickups();
  }

  viewDetails(item: any): void {
    console.log('Viewing details:', item._id);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
