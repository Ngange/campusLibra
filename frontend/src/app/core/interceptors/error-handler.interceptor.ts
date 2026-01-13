import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, Subject, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DialogService } from '../../services/dialog.service';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private tokenRefreshedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private dialogService: DialogService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors with login modal
        if (error.status === 401 && !request.url.includes('/auth/login')) {
          return this.handle401Error(request, next);
        }

        // Handle other errors
        return this.handleError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.tokenRefreshedSubject.next(false);

      // Open login modal to renew token
      return new Observable(observer => {
        this.dialogService.openLoginModal().subscribe({
          next: (success) => {
            this.isRefreshingToken = false;

            if (success) {
              // Token renewed successfully, notify waiting requests
              this.tokenRefreshedSubject.next(true);

              // Retry the original request
              next.handle(request).subscribe({
                next: (event) => observer.next(event),
                error: (err) => observer.error(err),
                complete: () => observer.complete()
              });
            } else {
              // User cancelled login, navigate to home
              this.tokenRefreshedSubject.next(false);
              this.router.navigate(['/']);
              observer.error(new Error('Authentication cancelled'));
            }
          },
          error: (err) => {
            this.isRefreshingToken = false;
            this.tokenRefreshedSubject.next(false);
            observer.error(err);
          }
        });
      });
    } else {
      // Wait for the token to be refreshed, then retry the request
      return this.tokenRefreshedSubject.pipe(
        filter(tokenRefreshed => tokenRefreshed !== false),
        take(1),
        switchMap(() => next.handle(request))
      );
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Requested resource not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.status === 503) {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
    }

    // Show error snackbar
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });

    return throwError(() => error);
  }
}
