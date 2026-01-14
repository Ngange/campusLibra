import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
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
    category?: string;
  };
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  private socket: Socket;
  private dashboardUpdateSubject = new Subject<void>();
  public dashboardUpdate$ = this.dashboardUpdateSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    // Initialize Socket.IO connection
    const socketUrl = environment.socketUrl || environment.apiUrl?.replace(/\/api$/, '') || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      autoConnect: false,
      path: '/socket.io'
    });

    // Listen for dashboard updates
    this.socket.on('dashboardUpdate', (data: any) => {
      this.ngZone.run(() => {
        console.log('Dashboard update received:', data);
        this.dashboardUpdateSubject.next();
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Dashboard socket connection error:', error);
    });
  }

  // Connect to dashboard updates
  connectDashboard(userId: string, role: string): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    this.socket.emit('joinDashboard', { userId, role });
    console.log(`Joined dashboard room for role: ${role}`);
  }

  // Disconnect from dashboard updates
  disconnectDashboard(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Admin dashboard stats
  getAdminStats(): Observable<DashboardStats> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/admin`)
      .pipe(map(response => response.data));
  }

  // Librarian dashboard stats
  getLibrarianStats(): Observable<DashboardStats> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/librarian`)
      .pipe(map(response => response.data));
  }

  // Member dashboard stats
  getMemberStats(): Observable<DashboardStats> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/member`)
      .pipe(map(response => response.data));
  }

  // Book circulation data
  getBookCirculation(): Observable<BookCirculationItem[]> {
    return this.http.get<{ success: boolean; data: BookCirculationItem[] }>(`${this.apiUrl}/book-circulation`)
      .pipe(map(response => response.data));
  }

  // Pending returns for librarian
  getPendingReturns(): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/pending-returns`)
      .pipe(map(response => response.data));
  }

  // Pending pickups for librarian
  getPendingPickups(): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/pending-pickups`)
      .pipe(map(response => response.data));
  }

  // Member's borrows
  getMyBorrows(): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/my-borrows`)
      .pipe(map(response => response.data));
  }

  // Member's reservations
  getMyReservations(): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/my-reservations`)
      .pipe(map(response => response.data));
  }
}
