import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { environment } from '../../environments/environment';

interface BooksResponse {
  success: boolean;
  books: Book[];
  total?: number;
}

interface BookResponse {
  success: boolean;
  book: Book;
}

interface CreateBookResponse {
  success: boolean;
  data: {
    book: Book;
  };
}

interface DeleteBookResponse {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  // Fetch books with optional filters and pagination
  getBooks(filters: {
    title?: string;
    author?: string;
    category?: string;
    availability?: 'available' | 'all';
    page?: number;
    limit?: number;
  } = {}): Observable<BooksResponse> {
    let params = new HttpParams();

    if (filters.title) params = params.set('title', filters.title);
    if (filters.author) params = params.set('author', filters.author);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.availability) params = params.set('availability', filters.availability);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));

    return this.http.get<BooksResponse>(this.apiUrl, { params });
  }

  // Fetch single book by id
  getBookById(id: string): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.apiUrl}/${id}`);
  }

  // Create a new book (admin)
  createBook(payload: Partial<Book> & { copyCount?: number }): Observable<CreateBookResponse> {
    return this.http.post<CreateBookResponse>(this.apiUrl, payload);
  }

  // Update an existing book (admin)
  updateBook(id: string, payload: Partial<Book>): Observable<BookResponse> {
    return this.http.put<BookResponse>(`${this.apiUrl}/${id}`, payload);
  }

  // Delete a book (admin)
  deleteBook(id: string): Observable<DeleteBookResponse> {
    return this.http.delete<DeleteBookResponse>(`${this.apiUrl}/${id}`);
  }
}
