import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FineService } from '../../services/fine.service';
import { NotificationService } from '../../services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-fines',
  templateUrl: './my-fines.component.html',
  styleUrls: ['./my-fines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyFinesComponent implements OnInit, OnDestroy {
  fines: any[] = [];
  loading = false;
  error = '';
  totalOutstanding = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fineService: FineService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyFines();
    this.subscribeToFineUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToFineUpdates(): void {
    // Listen for fine-related notifications and reload
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        // Check if any notification is fine-related
        const hasFineUpdate = notifications.some((notif) =>
          ['fine_applied', 'fine_paid'].includes(notif.type)
        );
        
        if (hasFineUpdate) {
          this.loadMyFines();
        }
      });
  }

  loadMyFines(): void {
    this.loading = true;
    this.error = '';

    this.fineService.getMyFines().pipe(takeUntil(this.destroy$)).subscribe({
      next: (fines) => {
        this.fines = Array.isArray(fines) ? fines : [];
        this.totalOutstanding = this.fines
          .filter(fine => !fine.isPaid)
          .reduce((sum, fine) => sum + fine.amount, 0);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load your fines.';
        this.loading = false;
        this.fines = [];
        this.cdr.markForCheck();
        this.snackBar.open(this.error, 'Close', { duration: 5000 });
      }
    });
  }

  getStatusText(isPaid: boolean): string {
    return isPaid ? 'Paid' : 'Outstanding';
  }

  getStatusColor(isPaid: boolean): string {
    return isPaid ? 'accent' : 'warn';
  }
}
