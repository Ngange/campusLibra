import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Reservation {
  _id: string;
  userId: string;
  bookId: string;
  bookTitle?: string;
  book?: any;
  user?: any;
  createdAt: Date;
  status: 'pending' | 'on_hold' | 'cancelled' | 'fulfilled';
  position: number;
  holdUntil?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  reserveBook(bookId: string): Observable<any> {
    return this.http.post<{ success: boolean; reservation: Reservation }>(`${this.apiUrl}`, { bookId })
      .pipe(
        map(response => response.reservation),
        catchError(this.handleError)
      );
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<{ success: boolean; reservations: Reservation[] }>(`${this.apiUrl}/my`)
      .pipe(
        map(response => Array.isArray(response.reservations) ? response.reservations : []),
        catchError(this.handleError)
      );
  }

  cancelReservation(reservationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${reservationId}`).pipe(catchError(this.handleError));
  }

  confirmPickup(reservationId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${reservationId}/pickup`, {})
      .pipe(catchError(this.handleError));
  }

  getPendingPickups(): Observable<Reservation[]> {
    return this.http.get<{ success: boolean; reservations: Reservation[] }>(`${this.apiUrl}/pending`)
      .pipe(
        map(response => Array.isArray(response.reservations) ? response.reservations : []),
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
      errorMessage = 'Resource not found.';
    } else if (error.status === 409) {
      errorMessage = 'You already have an active reservation for this book.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
