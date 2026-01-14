import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  selectedCategories: string[] = [];
  categories: string[] = [];

  // Books data
  featuredBooks: Book[] = [];
  loadingBooks = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const rawRole = this.currentUser?.role;
    // Normalize role to a string to avoid TitleCase pipe errors when role is an object
    this.userRole = typeof rawRole === 'string' ? rawRole : rawRole?.name || rawRole?.role || 'member';
    this.loadCategories();
    this.loadFeaturedBooks();
  }

  // Load distinct categories from backend
  loadCategories(): void {
    this.bookService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
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

    if (this.selectedCategories.length > 0) {
      filters.category = this.selectedCategories.join(',');
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
    const index = this.selectedCategories.indexOf(category);

    if (index > -1) {
      // Category is selected, remove it
      this.selectedCategories.splice(index, 1);
    } else {
      // Category is not selected, add it
      this.selectedCategories.push(category);
    }

    this.loadFeaturedBooks();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategories = [];
    this.loadFeaturedBooks();
  }

  // Navigate to role-specific dashboard
  goToDashboard(): void {
    const role = this.userRole.toLowerCase();
    switch(role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'librarian':
        this.router.navigate(['/librarian-dashboard']);
        break;
      default:
        this.router.navigate(['/member-dashboard']);
        break;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
