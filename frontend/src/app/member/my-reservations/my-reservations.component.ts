import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-reservations',
  standalone: false,
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  reservations: Reservation[] = [];
  loading = false;
  error: string | null = null;
  cancelingId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadMyReservations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMyReservations(): void {
    this.loading = true;
    this.error = null;

    this.reservationService.getMyReservations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reservations = response.data || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load your reservations.';
          this.loading = false;
        }
      });
  }

  cancelReservation(reservationId: string): void {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    this.cancelingId = reservationId;
    this.reservationService.cancelReservation(reservationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Reservation cancelled successfully!');
          this.cancelingId = null;
          this.loadMyReservations();
        },
        error: (err) => {
          this.cancelingId = null;
          alert(err.error?.message || 'Failed to cancel reservation.');
        }
      });
  }

  confirmPickup(reservationId: string): void {
    this.cancelingId = reservationId;
    this.reservationService.confirmPickup(reservationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Pickup confirmed! Book borrowed successfully.');
          this.cancelingId = null;
          this.loadMyReservations();
        },
        error: (err) => {
          this.cancelingId = null;
          alert(err.error?.message || 'Failed to confirm pickup.');
        }
      });
  }

  getActiveReservations(): Reservation[] {
    return this.reservations.filter(r => r.status === 'pending' || r.status === 'on_hold');
  }

  getCancelledReservations(): Reservation[] {
    return this.reservations.filter(r => r.status === 'cancelled' || r.status === 'fulfilled');
  }
}
