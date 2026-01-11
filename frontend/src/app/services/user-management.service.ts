import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params: filters });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  blockUser(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/block`, {});
  }

  unblockUser(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/unblock`, {});
  }
}
