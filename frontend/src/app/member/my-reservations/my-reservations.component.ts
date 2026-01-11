import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-reservations',
  standalone: false,
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  reservations: any[] = [];
  loading = false;
  error = '';

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMyReservations();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadMyReservations(): void {
    this.loading = true;
    this.error = '';
    this.reservationService.getMyReservations().subscribe({
      next: (reservations) => {
        this.reservations = Array.isArray(reservations) ? reservations : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load your reservations.';
        this.loading = false;
        this.reservations = [];
        this.snackBar.open(this.error, 'Close', { duration: 5000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'on_hold': return 'primary';
      case 'fulfilled': return 'accent';
      default: return 'primary';
    }
  }

  trackByReservationId(index: number, reservation: any): string {
    return reservation._id;
  }
}
