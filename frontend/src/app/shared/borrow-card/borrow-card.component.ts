import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Borrow, BorrowService } from '../../services/borrow.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-borrow-card',
  standalone: false,
  templateUrl: './borrow-card.component.html',
  styleUrls: ['./borrow-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BorrowCardComponent {
  @Input() borrow!: Borrow;

  renewing = false;
  renewError: string | null = null;

  constructor(
    private borrowService: BorrowService,
    private snackBar: MatSnackBar
  ) {}

  isOverdue(): boolean {
    const today = new Date();
    const dueDate = new Date(this.borrow.dueDate);
    return dueDate < today && this.borrow.status === 'active';
  }

  daysUntilDue(): number {
    const today = new Date();
    const dueDate = new Date(this.borrow.dueDate);
    const diff = dueDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  renewBook(): void {
    // Prevent multiple clicks
    if (this.renewing) return;

    this.renewing = true;
    this.renewError = null;

    this.borrowService.renewBorrow(this.borrow._id).subscribe({
      next: (updatedBorrow: Borrow) => {
        // Replace entire borrow object with updated one
        this.borrow = updatedBorrow;
        this.renewing = false;

        // Add success notification
        this.snackBar.open('Book renewed successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      },
      error: (err: any) => {
        // Fix: Use err.message instead of err.error?.message
        this.renewError = err.message || 'Failed to renew book';
        this.renewing = false;

        // Add error notification
        if (this.renewError) {
          this.snackBar.open(this.renewError, 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      }
    });
  }
}
