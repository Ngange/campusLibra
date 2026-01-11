import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuditLog {
  _id: string;
  action: string;
  userId: any;
  bookId: any;
  metadata: any;
  timestamp: Date;
}

export interface AuditFilters {
  userId?: string;
  bookId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getAuditTrail(filters?: AuditFilters): Observable<AuditLog[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.userId) params = params.set('userId', filters.userId);
      if (filters.bookId) params = params.set('bookId', filters.bookId);
      if (filters.action) params = params.set('action', filters.action);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<AuditLog[]>(this.apiUrl, { params });
  }

  getAuditLogsByUser(userId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAuditLogsByBook(bookId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/book/${bookId}`);
  }
}
