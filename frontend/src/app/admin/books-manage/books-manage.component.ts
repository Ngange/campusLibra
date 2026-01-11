import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BookService } from '../../services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormErrorService } from '../../shared/services/form-error.service';
import { LoadingStateService } from '../../shared/services/loading-state.service';
import { isbnValidator } from '../../shared/validators/custom-validators';
import { finalize } from 'rxjs/operators';
import { EditBookDialogComponent } from './edit-book-dialog/edit-book-dialog.component';
import { CreateBookDialogComponent } from './create-book-dialog/create-book-dialog.component';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-books-manage',
  templateUrl: './books-manage.component.html',
  styleUrls: ['./books-manage.component.scss']
})
export class BooksManageComponent implements OnInit {
  books: any[] = [];
  allBooks: any[] = [];
  loading = false;
  filterForm: FormGroup;
  categories = ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Fantasy'];

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public formErrorService: FormErrorService,
    public loadingStateService: LoadingStateService,
    private dialogService: DialogService
  ) {
    this.filterForm = this.fb.group({
      title: [''],
      author: [''],
      category: ['']
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks({}).subscribe({
      next: (response) => {
        this.allBooks = response.books || [];
        this.books = this.allBooks;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load books.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.books = this.allBooks.filter(book => {
      const titleMatch = !filters.title || book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch = !filters.author || book.author.toLowerCase().includes(filters.author.toLowerCase());
      const categoryMatch = !filters.category || book.category === filters.category;
      return titleMatch && authorMatch && categoryMatch;
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.books = this.allBooks;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateBookDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadBooks();
      }
    });
  }

  deleteBook(bookId: string, bookTitle: string): void {
    this.dialogService.delete(bookTitle).subscribe(confirmed => {
      if (!confirmed) return;

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
          }
        });
    });
  }

  editBook(bookId: string): void {
    const book = this.books.find(b => b._id === bookId);
    if (!book) return;

    const dialogRef = this.dialog.open(EditBookDialogComponent, {
      width: '500px',
      data: { bookId, book }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadBooks();
      }
    });
  }
}
