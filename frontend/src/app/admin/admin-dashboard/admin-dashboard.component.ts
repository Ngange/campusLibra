import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats, BookCirculationItem } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
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

  circulationBooks: BookCirculationItem[] = [];
  currentYear = new Date().getFullYear();
  isLoading = true;

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
        this.circulationBooks = books;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load book circulation.', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
