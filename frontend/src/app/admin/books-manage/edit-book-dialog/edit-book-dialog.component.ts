import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookService } from '../../../services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormErrorService } from '../../../shared/services/form-error.service';
import { LoadingStateService } from '../../../shared/services/loading-state.service';
import { isbnValidator } from '../../../shared/validators/custom-validators';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-book-dialog',
  templateUrl: './edit-book-dialog.component.html',
  styleUrls: ['./edit-book-dialog.component.scss']
})
export class EditBookDialogComponent implements OnInit {
  editForm: FormGroup;
  categories = ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Fantasy'];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private snackBar: MatSnackBar,
    public formErrorService: FormErrorService,
    public loadingStateService: LoadingStateService,
    public dialogRef: MatDialogRef<EditBookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bookId: string; book: any }
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', [Validators.required, isbnValidator()]],
      category: ['', Validators.required],
      copyCount: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.data.book) {
      this.editForm.patchValue({
        title: this.data.book.title,
        author: this.data.book.author,
        isbn: this.data.book.isbn,
        category: this.data.book.category,
        copyCount: this.data.book.totalCopies || 1
      });
    }
  }

  onSave(): void {
    if (this.editForm.invalid) {
      this.formErrorService.markAllAsTouched(this.editForm);
      return;
    }

    this.isLoading = true;
    const updateData = this.editForm.value;

    this.bookService
      .updateBook(this.data.bookId, updateData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Book updated successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(response.book);
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to update book.';
          this.snackBar.open(message, 'Close', { duration: 4000 });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
