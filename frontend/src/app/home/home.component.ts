import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BookService } from '../services/book.service';
import { Book } from '../models/book.model';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: any = null;
  userRole: string = 'member';

  // Search & filter state
  searchQuery: string = '';
  selectedCategory: string = '';
  categories: string[] = ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Fantasy'];

  // Books data
  featuredBooks: Book[] = [];
  loadingBooks = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const rawRole = this.currentUser?.role;
    // Normalize role to a string to avoid TitleCase pipe errors when role is an object
    this.userRole = typeof rawRole === 'string' ? rawRole : rawRole?.name || rawRole?.role || 'member';
    this.loadFeaturedBooks();
  }

  // Load books based on current filters
  loadFeaturedBooks(): void {
    this.loadingBooks = true;
    this.error = null;

    const filters: any = {
      limit: 6
    };

    if (this.searchQuery) {
      filters.title = this.searchQuery;
    }

    if (this.selectedCategory) {
      filters.category = this.selectedCategory;
    }

    this.bookService.getBooks(filters).subscribe({
      next: (response) => {
        this.featuredBooks = response.books;
        this.loadingBooks = false;
      },
      error: (err) => {
        this.error = 'Failed to load books. Please try again later.';
        this.loadingBooks = false;
        console.error('Book loading error:', err);
      }
    });
  }

  // Handle search input (debounced in template)
  onSearchChange(): void {
    this.loadFeaturedBooks();
  }

  // Handle category selection
  onCategorySelect(category: string): void {
    this.selectedCategory = category === this.selectedCategory ? '' : category;
    this.loadFeaturedBooks();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.loadFeaturedBooks();
  }

  logout(): void {
    this.authService.logout();
  }
}
