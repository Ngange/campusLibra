import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Borrow {
  _id: string;
  user: any;
  book: any;
  bookCopy: any;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class BorrowService {
  private apiUrl = `${environment.apiUrl}/borrows`;

  constructor(private http: HttpClient) { }

  borrowBook(bookId: string): Observable<Borrow> {
    return this.http.post<{ success: boolean; borrow: Borrow }>(this.apiUrl, { bookId })
      .pipe(
        map(response => response.borrow),
        catchError(this.handleError)
      );
  }

  getMyBorrows(): Observable<Borrow[]> {
    return this.http.get<{ success: boolean; borrows: Borrow[] }>(`${this.apiUrl}/my`)
      .pipe(
        map(response => {
          // Ensure borrows is always an array
          return Array.isArray(response.borrows) ? response.borrows : [];
        }),
        catchError(this.handleError)
      );
  }

  renewBorrow(borrowId: string): Observable<Borrow> {
    return this.http.patch<{ success: boolean; borrow: Borrow }>(`${this.apiUrl}/${borrowId}/renew`, {})
      .pipe(
        map(response => response.borrow),
        catchError(this.handleError)
      );
  }

  returnBorrow(borrowId: string): Observable<{ borrow: Borrow; fine: any }> {
    return this.http.patch<{ success: boolean; borrow: Borrow; fine: any }>(`${this.apiUrl}/${borrowId}/return`, {})
      .pipe(
        map(response => ({ borrow: response.borrow, fine: response.fine })),
        catchError(this.handleError)
      );
  }

  getActiveBorrows(): Observable<Borrow[]> {
    return this.http.get<{ success: boolean; borrows: Borrow[] }>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          // Ensure borrows is always an array
          return Array.isArray(response.borrows) ? response.borrows : [];
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid request. Please try again.';
    } else if (error.status === 404) {
      errorMessage = 'Book not found.';
    } else if (error.status === 409) {
      errorMessage = 'This book is already borrowed by you.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
