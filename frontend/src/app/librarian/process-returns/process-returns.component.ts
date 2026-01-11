import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BorrowService, Borrow } from '../../services/borrow.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReturnBookModalComponent } from '../return-book-modal/return-book-modal.component';

@Component({
  selector: 'app-process-returns',
  standalone: false,
  templateUrl: './process-returns.component.html',
  styleUrls: ['./process-returns.component.scss']
})
export class ProcessReturnsComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  activeBorrows: Borrow[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private borrowService: BorrowService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadActiveBorrows();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadActiveBorrows(searchTerm: string = ''): void {
    this.loading = true;
    this.error = null;

    this.borrowService.getActiveBorrows()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (borrows) => {
        // Filter by search term if provided
        if (searchTerm) {
          this.activeBorrows = borrows.filter(borrow =>
            (borrow.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (borrow.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (borrow.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        } else {
          this.activeBorrows = borrows;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load active borrows.';
        this.loading = false;
        this.activeBorrows = [];
      }
    });
  }

  onSearch(): void {
    const term = this.searchForm.get('searchTerm')?.value || '';
    this.loadActiveBorrows(term);
  }

  openReturnModal(borrow: Borrow): void {
    const dialogRef = this.dialog.open(ReturnBookModalComponent, {
      width: '500px',
      data: { borrow },
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result?.success) {
          const term = this.searchForm.get('searchTerm')?.value || '';
          this.loadActiveBorrows(term);
          this.snackBar.open('Return processed successfully.', 'Close', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        }
      });
  }
}
