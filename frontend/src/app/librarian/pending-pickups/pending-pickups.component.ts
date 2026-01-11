import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-pending-pickups',
  templateUrl: './pending-pickups.component.html',
  styleUrls: ['./pending-pickups.component.scss']
})
export class PendingPickupsComponent implements OnInit {
  pendingReservations: any[] = [];
  loading = false;
  error = '';

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadPendingPickups();
  }

  loadPendingPickups(): void {
    this.loading = true;
    this.error = '';

    this.reservationService.getPendingPickups().subscribe({
      next: (reservations) => {
        this.pendingReservations = Array.isArray(reservations) ? reservations : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load pending pickups.';
        this.loading = false;
        this.pendingReservations = [];
        this.snackBar.open(this.error, 'Close', { duration: 5000 });
      }
    });
  }

  fulfillPickup(reservationId: string): void {
    this.dialogService.confirm(
      'Confirm that this book has been picked up by the member?',
      'Confirm Pickup'
    ).subscribe(confirmed => {
      if (!confirmed) return;

      this.reservationService.confirmPickup(reservationId).subscribe({
      next: () => {
        this.snackBar.open('Pickup fulfilled successfully!', 'Close', { duration: 3000 });
        this.loadPendingPickups();
      },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to fulfill pickup.', 'Close', { duration: 5000 });
        }
      });
    });
  }
}
