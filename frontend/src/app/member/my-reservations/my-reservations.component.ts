import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  private destroy$ = new Subject<void>();

  constructor(
    private reservationService: ReservationService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyReservations();
    this.subscribeToReservationUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToReservationUpdates(): void {
    // Listen for reservation-related notifications and reload
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        // Check if any notification is reservation-related
        const hasReservationUpdate = notifications.some((notif) =>
          ['reservation_created', 'reservation_available', 'reservation_fulfilled', 'hold_expired'].includes(notif.type)
        );

        if (hasReservationUpdate) {
          this.loadMyReservations();
        }
      });
  }

  loadMyReservations(): void {
    this.loading = true;
    this.error = '';
    this.reservationService.getMyReservations().subscribe({
      next: (reservations) => {
        this.reservations = Array.isArray(reservations) ? reservations : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load your reservations.';
        this.loading = false;
        this.reservations = [];
        this.cdr.markForCheck();
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
