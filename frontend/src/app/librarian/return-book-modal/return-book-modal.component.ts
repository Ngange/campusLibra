import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BorrowService } from '../../services/borrow.service';

export interface ReturnBookData {
  borrow: any;
}

@Component({
  selector: 'app-return-book-modal',
  templateUrl: './return-book-modal.component.html',
  styleUrls: ['./return-book-modal.component.scss']
})
export class ReturnBookModalComponent {
  processing = false;
  error = '';
  today = new Date();
  markAsDamaged = false;

  constructor(
    public dialogRef: MatDialogRef<ReturnBookModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReturnBookData,
    private borrowService: BorrowService,
    private snackBar: MatSnackBar
  ) {}

  get isOverdue(): boolean {
    if (!this.data.borrow) return false;
    return this.today > new Date(this.data.borrow.dueDate);
  }

  get fineAmount(): number {
    if (!this.isOverdue) return 0;
    const dueDate = new Date(this.data.borrow.dueDate);
    const diffTime = this.today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 0.5;
  }

  processReturn(): void {
    if (this.processing) return;

    this.processing = true;
    this.error = '';

    this.borrowService.returnBorrow(this.data.borrow._id, this.markAsDamaged).subscribe({
      next: (response) => {
        this.processing = false;
        this.snackBar.open('Book returned successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.dialogRef.close({ success: true, borrow: response.borrow });
      },
      error: (err) => {
        this.processing = false;
        this.error = err.message || 'Failed to process return';
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
