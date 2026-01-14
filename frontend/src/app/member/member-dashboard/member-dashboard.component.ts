import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberDashboardComponent implements OnInit {
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
