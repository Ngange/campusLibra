import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { BorrowService, Borrow } from '../../services/borrow.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Book } from '../../models/book.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-book-details',
  standalone: false,
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss']
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null;
  loading = false;
  error: string | null = null;
  borrowing = false;
  reserving = false;
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private borrowService: BorrowService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(id);
    }
  }

  loadBook(id: string): void {
    this.loading = true;
    this.error = null;

    this.bookService.getBookById(id).subscribe({
      next: (response) => {
        this.book = response.book;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load book details.';
        this.loading = false;
        if (this.error) {
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
        }
      }
    });
  }

  borrowBook(): void {
    if (!this.book || !this.currentUser || this.borrowing) return;

    this.borrowing = true;

    this.borrowService.borrowBook(this.book._id).subscribe({
      next: (borrow: Borrow) => {
        this.borrowing = false;
        this.snackBar.open('Book borrowed successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        // Redirect to My Borrows page
        this.router.navigate(['/member/my-borrows']);
      },
      error: (err) => {
        this.borrowing = false;
        this.snackBar.open(err.message || 'Failed to borrow book.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  reserveBook(): void {
    if (!this.book || !this.currentUser) return;

    this.reserving = true;
    this.reservationService.reserveBook(this.book._id).subscribe({
      next: (response) => {
        this.reserving = false;
        this.snackBar.open('Book reserved successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.router.navigate(['/member/my-reservations']);
      },
      error: (err) => {
        this.reserving = false;
        this.snackBar.open(err.message || 'Failed to reserve book.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }
}
