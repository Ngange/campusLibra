import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../services/dialog.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pending-pickups',
  templateUrl: './pending-pickups.component.html',
  styleUrls: ['./pending-pickups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingPickupsComponent implements OnInit, OnDestroy {
  pendingReservations: any[] = [];
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private reservationService: ReservationService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPendingPickups();
    this.subscribeToPendingPickupUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToPendingPickupUpdates(): void {
    // Listen for reservation-related notifications and reload
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        // Check if any notification is reservation-related (especially fulfilled)
        const hasPickupUpdate = notifications.some((notif) =>
          ['reservation_available', 'reservation_fulfilled'].includes(notif.type)
        );

        if (hasPickupUpdate) {
          this.loadPendingPickups();
        }
      });
  }

  loadPendingPickups(): void {
    this.loading = true;
    this.error = '';

    this.reservationService.getPendingPickups().pipe(takeUntil(this.destroy$)).subscribe({
      next: (reservations) => {
        this.pendingReservations = Array.isArray(reservations) ? reservations : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load pending pickups.';
        this.loading = false;
        this.pendingReservations = [];
        this.cdr.markForCheck();
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
