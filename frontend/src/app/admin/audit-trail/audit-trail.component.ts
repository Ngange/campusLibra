import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { BookService } from '../../services/book.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss']
})
export class AuditTrailComponent implements OnInit {
  auditLogs: any[] = [];
  loading = false;
  filterForm: FormGroup;
  actions = ['borrowed', 'returned', 'reserved', 'book_created', 'book_updated', 'USER_BLOCKED', 'USER_UNBLOCKED', 'USER_UPDATED', 'USER_DELETED'];
  displayedColumns = ['timestamp', 'action', 'user', 'book', 'details'];
  users: any[] = [];
  books: any[] = [];
  filteredUsers$: Observable<any[]>;
  filteredBooks$: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private auditService: AuditService,
    private bookService: BookService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      userName: [''],
      bookTitle: [''],
      userId: [''],
      bookId: [''],
      action: [''],
      startDate: [''],
      endDate: ['']
    });

    this.filteredUsers$ = this.filterForm.get('userName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value))
    );

    this.filteredBooks$ = this.filterForm.get('bookTitle')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBooks(value))
    );
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadBooks();
    this.loadAuditTrail();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.users || [];
      },
      error: () => {
        this.users = [];
      }
    });
  }

  loadBooks(): void {
    this.bookService.getBooks({}).subscribe({
      next: (response) => {
        this.books = response.books || [];
      },
      error: () => {
        this.books = [];
      }
    });
  }

  private _filterUsers(value: string | any): any[] {
    if (!value || typeof value !== 'string') return [];
    const filterValue = value.toLowerCase();
    return this.users.filter(user =>
      user.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterBooks(value: string | any): any[] {
    if (!value || typeof value !== 'string') return [];
    const filterValue = value.toLowerCase();
    return this.books.filter(book =>
      book.title.toLowerCase().includes(filterValue)
    );
  }

  onUserSelected(user: any): void {
    this.filterForm.patchValue({ userId: user._id });
  }

  onBookSelected(book: any): void {
    this.filterForm.patchValue({ bookId: book._id });
  }

  getUserDisplayName(user: any): string {
    return user.name || '';
  }

  getBookDisplayTitle(book: any): string {
    return book.title || '';
  }

  loadAuditTrail(): void {
    this.loading = true;
    const filters = this.filterForm.value;

    this.auditService.getAuditTrail(filters).subscribe({
      next: (logs) => {
        // Ensure array for MatTable
        this.auditLogs = Array.isArray(logs) ? logs : [];
        this.loading = false;
      },
      error: (err) => {
        this.auditLogs = []; // Fallback to empty array
        this.snackBar.open('Failed to load audit trail.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadAuditTrail();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadAuditTrail();
  }

  clearUserFilter(): void {
    this.filterForm.patchValue({ userName: '', userId: '' });
  }

  clearBookFilter(): void {
    this.filterForm.patchValue({ bookTitle: '', bookId: '' });
  }

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'borrowed': 'book',
      'returned': 'assignment_return',
      'reserved': 'bookmark',
      'book_created': 'library_add',
      'book_updated': 'edit',
      'user_updated': 'person'
    };
    return iconMap[action] || 'info';
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
