import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormErrorService } from '../../shared/services/form-error.service';
import { LoadingStateService } from '../../shared/services/loading-state.service';
import { isbnValidator } from '../../shared/validators/custom-validators';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-books-manage',
  templateUrl: './books-manage.component.html',
  styleUrls: ['./books-manage.component.scss']
})
export class BooksManageComponent implements OnInit {
  books: any[] = [];
  loading = false;
  bookForm: FormGroup;
  categories = ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Fantasy'];

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private snackBar: MatSnackBar,
    public formErrorService: FormErrorService,
    public loadingStateService: LoadingStateService
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', [Validators.required, isbnValidator()]],
      category: ['', Validators.required],
      copyCount: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks({}).subscribe({
      next: (response) => {
        this.books = response.books || [];
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load books.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  createBook(): void {
    if (this.bookForm.invalid) {
      this.formErrorService.markAllAsTouched(this.bookForm);
      return;
    }

    const bookData = this.bookForm.value;
    const loadingKey = 'createBook';
    this.loadingStateService.setLoading(loadingKey, true);

    this.bookService
      .createBook(bookData)
      .pipe(finalize(() => this.loadingStateService.setLoading(loadingKey, false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Book created successfully!', 'Close', { duration: 3000 });
          this.bookForm.reset({ copyCount: 1 });
          this.loadBooks();
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to create book.';
          this.snackBar.open(message, 'Close', { duration: 4000 });
        },
      });
  }

  deleteBook(bookId: string, bookTitle: string): void {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return;
    }

    const loadingKey = `delete-${bookId}`;
    this.loadingStateService.setLoading(loadingKey, true);

    this.bookService
      .deleteBook(bookId)
      .pipe(finalize(() => this.loadingStateService.setLoading(loadingKey, false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Book deleted successfully!', 'Close', { duration: 3000 });
          this.loadBooks();
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to delete book.';
          this.snackBar.open(message, 'Close', { duration: 4000 });
        },
      });
  }
}
