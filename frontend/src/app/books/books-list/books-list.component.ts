import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-books-list',
  standalone: false,
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooksListComponent implements OnInit {
  books: Book[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalBooks = 0;
  limit = 12;

  // Filters
  searchQuery: string = '';
  selectedCategory: string = '';
  availabilityFilter: 'all' | 'available' = 'all';
  categories: string[] = ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Fantasy'];

  constructor(private bookService: BookService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(page: number = 1): void {
    this.currentPage = page;
    this.loading = true;
    this.error = null;

    const filters: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.searchQuery) filters.title = this.searchQuery;
    if (this.selectedCategory) filters.category = this.selectedCategory;
    if (this.availabilityFilter === 'available') filters.availability = 'available';

    this.bookService.getBooks(filters).subscribe({
      next: (response) => {
        this.books = response.books;
        this.totalBooks = response.total || 0;
        this.totalPages = Math.ceil(this.totalBooks / this.limit);
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (err) => {
        this.error = 'Failed to load books.';
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection
        console.error('Books loading error:', err);
      }
    });
  }

  onSearch(): void {
    this.loadBooks(1); // Reset to first page on new search
  }

  onCategorySelect(category: string): void {
    this.selectedCategory = category === this.selectedCategory ? '' : category;
    this.loadBooks(1);
  }

  onAvailabilityChange(): void {
    this.loadBooks(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.availabilityFilter = 'all';
    this.loadBooks(1);
  }

  trackByBookId(index: number, book: Book): string {
    return book._id;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadBooks(page);
    }
  }
}
