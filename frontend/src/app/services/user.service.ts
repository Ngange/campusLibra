import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params: filters })
      .pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  blockUser(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/block`, {})
      .pipe(catchError(this.handleError));
  }

  unblockUser(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/unblock`, {})
      .pipe(catchError(this.handleError));
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
      errorMessage = 'User not found.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
