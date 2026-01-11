import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BorrowService, Borrow } from '../../services/borrow.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-borrows',
  standalone: false,
  templateUrl: './my-borrows.component.html',
  styleUrls: ['./my-borrows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBorrowsComponent implements OnInit, OnDestroy {
  borrows: Borrow[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private borrowService: BorrowService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBorrows();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBorrows(): void {
    this.loading = true;
    this.error = null;

    this.borrowService.getMyBorrows()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (borrows) => {
          // Ensure we always have an array
          this.borrows = Array.isArray(borrows) ? borrows : [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err.message || 'Failed to load your borrows.';
          this.loading = false;
          // Keep borrows as empty array on error
          this.borrows = [];
          this.cdr.markForCheck();
          if (this.error) {
            this.snackBar.open(this.error, 'Close', { duration: 5000 });
          }
        }
      });
  }

  getActiveBorrows(): Borrow[] {
    return this.borrows.filter(b => b.status === 'active');
  }

  getReturnedBorrows(): Borrow[] {
    return this.borrows.filter(b => b.status === 'returned');
  }

  getOverdueBorrows(): Borrow[] {
    return this.borrows.filter(b => b.status === 'overdue');
  }

  isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate);
  }

  trackByBorrowId(index: number, borrow: Borrow): string {
    return borrow._id;
  }
}
