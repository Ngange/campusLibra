import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats, BookCirculationItem } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu } from '@angular/material/menu';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chartMenu') chartMenu!: MatMenu;
  @ViewChild('tableMenu') tableMenu!: MatMenu;

  currentUser: any = null;
  stats: DashboardStats = {
    totalBooks: 0,
    totalMembers: 0,
    issuedBooks: 0,
    reservedBooks: 0,
    overdueBooks: 0,
    circulationPercentage: 0,
    totalFines: 0,
    activeUsers: 0
  };

  circulationBooks = new MatTableDataSource<BookCirculationItem>([]);
  currentYear = new Date().getFullYear();
  isLoading = true;
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
    this.loadCirculationBooks();

    // Connect to real-time dashboard updates
    this.dashboardService.connectDashboard(this.currentUser.id, 'admin');

    // Subscribe to dashboard updates
    this.dashboardSubscription = this.dashboardService.dashboardUpdate$.subscribe(() => {
      console.log('Refreshing admin dashboard due to update...');
      this.loadStats();
      this.loadCirculationBooks();
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
    this.dashboardService.getAdminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        const total = stats.issuedBooks + stats.reservedBooks + stats.overdueBooks;
        if (total > 0) {
          this.stats.circulationPercentage = Math.round((stats.issuedBooks / stats.totalBooks) * 100);
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load statistics.', 'Close', { duration: 5000 });
      }
    });
  }

  loadCirculationBooks(): void {
    this.dashboardService.getBookCirculation().subscribe({
      next: (books) => {
        this.circulationBooks.data = books;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load book circulation.', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  refresh(): void {
    this.loadStats();
    this.loadCirculationBooks();
    this.snackBar.open('Dashboard refreshed', 'Close', { duration: 2000 });
  }

  calculateIssuedAngle(): number {
    if (!this.stats.totalBooks) return 0;
    const percentage = (this.stats.issuedBooks / this.stats.totalBooks) * 100;
    return (percentage / 100) * 360;
  }

  calculateReservedAngle(): number {
    if (!this.stats.totalBooks) return 0;
    const percentage = (this.stats.reservedBooks / this.stats.totalBooks) * 100;
    return (percentage / 100) * 360;
  }

  calculateOverdueAngle(): number {
    if (!this.stats.totalBooks) return 0;
    const percentage = (this.stats.overdueBooks / this.stats.totalBooks) * 100;
    return (percentage / 100) * 360;
  }
}
