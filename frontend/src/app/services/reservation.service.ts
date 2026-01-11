import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reservation {
  _id: string;
  userId: string;
  bookId: string;
  bookTitle?: string;
  createdAt: Date;
  status: 'pending' | 'on_hold' | 'cancelled' | 'fulfilled';
  queuePosition: number;
  holdUntil?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  reserveBook(bookId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, { bookId });
  }

  getMyReservations(): Observable<{ success: boolean; data: Reservation[] }> {
    return this.http.get<{ success: boolean; data: Reservation[] }>(`${this.apiUrl}/my`);
  }

  cancelReservation(reservationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${reservationId}`);
  }

  confirmPickup(reservationId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${reservationId}/pickup`, {});
  }
}
