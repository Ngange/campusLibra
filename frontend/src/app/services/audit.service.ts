import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

    return this.http.get<{ success: boolean; auditLogs: any[] }>(this.apiUrl, { params }).pipe(
      map(response => Array.isArray(response.auditLogs) ? response.auditLogs : [])
    );
  }

  getAuditLogsByUser(userId: string): Observable<AuditLog[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/user/${userId}`).pipe(
      map(response => Array.isArray(response.data) ? response.data : [])
    );
  }

  getAuditLogsByBook(bookId: string): Observable<AuditLog[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/book/${bookId}`).pipe(
      map(response => Array.isArray(response.data) ? response.data : [])
    );
  }
}
