import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Fine {
  _id: string;
  borrow: any;
  amount: number;
  isPaid: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FineService {
  private apiUrl = `${environment.apiUrl}/fines`;

  constructor(private http: HttpClient) {}

  getMyFines(): Observable<Fine[]> {
    return this.http.get<{ success: boolean; fines: Fine[] }>(`${this.apiUrl}/my`)
      .pipe(
        map(response => Array.isArray(response.fines) ? response.fines : []),
        catchError(this.handleError)
      );
  }

  payFine(fineId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${fineId}/pay`, {})
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
      errorMessage = 'Fine not found.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
