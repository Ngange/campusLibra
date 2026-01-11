import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BookService } from '../services/book.service';
import { Book } from '../models/book.model';

// Home page shows role-specific quick actions after login
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: any = null;
  userRole = 'member';
  books: Book[] = [];
  loadingBooks = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const roleValue = this.currentUser?.role;
    this.userRole = typeof roleValue === 'string'
      ? roleValue
      : roleValue?.name || roleValue?.role || 'member';
    this.loadFeaturedBooks();
  }

  private loadFeaturedBooks(): void {
    this.loadingBooks = true;
    this.error = null;

    this.bookService.getBooks({ availability: 'available', limit: 6 }).subscribe({
      next: (response) => {
        this.books = response.books;
        this.loadingBooks = false;
      },
      error: (err) => {
        this.error = 'Failed to load books. Please try again later.';
        this.loadingBooks = false;
        console.error('Book loading error:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
