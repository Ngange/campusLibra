import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BookService } from '../../../services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormErrorService } from '../../../shared/services/form-error.service';
import { isbnValidator } from '../../../shared/validators/custom-validators';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-book-dialog',
  templateUrl: './create-book-dialog.component.html',
  styleUrls: ['./create-book-dialog.component.scss']
})
export class CreateBookDialogComponent {
  bookForm: FormGroup;
  categories = ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Fantasy'];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private snackBar: MatSnackBar,
    public formErrorService: FormErrorService,
    public dialogRef: MatDialogRef<CreateBookDialogComponent>
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', [Validators.required, isbnValidator()]],
      category: ['', Validators.required],
      copyCount: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onCreate(): void {
    if (this.bookForm.invalid) {
      this.formErrorService.markAllAsTouched(this.bookForm);
      return;
    }

    this.isLoading = true;
    const bookData = this.bookForm.value;

    this.bookService
      .createBook(bookData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Book created successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(response.book || response);
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to create book.';
          this.snackBar.open(message, 'Close', { duration: 4000 });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
