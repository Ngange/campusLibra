import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu } from '@angular/material/menu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss']
})
export class MemberDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('borrowsMenu') borrowsMenu!: MatMenu;
  @ViewChild('reservationsMenu') reservationsMenu!: MatMenu;

  currentUser: any = null;
  stats: DashboardStats = {
    totalBooks: 0,
    issuedBooks: 0,
    reservedBooks: 0,
    overdueBooks: 0
  };

  myBorrows: any[] = [];
  myReservations: any[] = [];
  currentYear = new Date().getFullYear();
  isLoadingBorrows = true;
  isLoadingReservations = true;
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
    this.loadMyBorrows();
    this.loadMyReservations();

    // Connect to real-time dashboard updates
    this.dashboardService.connectDashboard(this.currentUser.id, 'member');

    // Subscribe to dashboard updates
    this.dashboardSubscription = this.dashboardService.dashboardUpdate$.subscribe(() => {
      console.log('Refreshing member dashboard due to update...');
      this.loadStats();
      this.loadMyBorrows();
      this.loadMyReservations();
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
    this.dashboardService.getMemberStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load statistics.', 'Close', { duration: 5000 });
      }
    });
  }

  loadMyBorrows(): void {
    this.dashboardService.getMyBorrows().subscribe({
      next: (borrows) => {
        this.myBorrows = borrows;
        this.isLoadingBorrows = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load your borrows.', 'Close', { duration: 5000 });
        this.isLoadingBorrows = false;
      }
    });
  }

  refresh(): void {
    this.loadStats();
    this.loadMyBorrows();
    this.loadMyReservations();
    this.snackBar.open('Dashboard refreshed', 'Close', { duration: 2000 });
  }

  loadMyReservations(): void {
    this.dashboardService.getMyReservations().subscribe({
      next: (reservations) => {
        this.myReservations = reservations;
        this.isLoadingReservations = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to load your reservations.', 'Close', { duration: 5000 });
        this.isLoadingReservations = false;
      }
    });
  }

  renewBorrow(borrow: any): void {
    console.log('Renewing borrow:', borrow._id);
    this.snackBar.open('Borrow renewed successfully!', 'Close', { duration: 3000 });
    this.loadMyBorrows();
  }

  confirmPickup(reservation: any): void {
    console.log('Confirming pickup:', reservation._id);
    this.snackBar.open('Pickup confirmed successfully!', 'Close', { duration: 3000 });
    this.loadMyReservations();
  }

  cancelReservation(reservation: any): void {
    console.log('Canceling reservation:', reservation._id);
    this.snackBar.open('Reservation canceled successfully!', 'Close', { duration: 3000 });
    this.loadMyReservations();
  }

  viewDetails(item: any): void {
    console.log('Viewing details:', item._id);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
