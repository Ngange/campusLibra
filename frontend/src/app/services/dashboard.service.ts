import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalBooks: number;
  totalMembers?: number;
  issuedBooks: number;
  reservedBooks: number;
  overdueBooks: number;
  circulationPercentage?: number;
  totalFines?: number;
  activeUsers?: number;
}

export interface BookCirculationItem {
  book: {
    _id: string;
    title: string;
    author: string;
    publisher?: string;
  };
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  // Admin dashboard stats
  getAdminStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin`);
  }

  // Librarian dashboard stats
  getLibrarianStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/librarian`);
  }

  // Member dashboard stats
  getMemberStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/member`);
  }

  // Book circulation data
  getBookCirculation(): Observable<BookCirculationItem[]> {
    return this.http.get<BookCirculationItem[]>(`${this.apiUrl}/book-circulation`);
  }

  // Pending returns for librarian
  getPendingReturns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-returns`);
  }

  // Pending pickups for librarian
  getPendingPickups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-pickups`);
  }

  // Member's borrows
  getMyBorrows(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-borrows`);
  }

  // Member's reservations
  getMyReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-reservations`);
  }
}
