import { Injectable, Injector } from '@angular/core';
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
import { AuthService } from '../../services/auth.service';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private tokenRefreshedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private dialogService: DialogService,
    private injector: Injector
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if current route is a public auth route
        const isPublicAuthRoute =
          this.router.url.includes('/login') ||
          this.router.url.includes('/register') ||
          this.router.url === '/';

        // Handle 401 Unauthorized errors with login modal (only on protected routes)
        if (error.status === 401 && !isPublicAuthRoute && !request.url.includes('/auth/login')) {
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

      const authService = this.injector.get(AuthService);

      // Skip refresh attempt if no refresh token or if this IS a refresh request
      if (!authService.getRefreshToken() || request.url.includes('/auth/refresh')) {
        return this.showLoginModalAndRetry(request, next);
      }

      // Attempt to refresh token automatically
      return new Observable(observer => {
        authService.refreshToken().subscribe({
          next: (response) => {
            this.isRefreshingToken = false;
            this.tokenRefreshedSubject.next(true);

            // Retry the original request with the new token
            const retryRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${response.token}`
              }
            });

            next.handle(retryRequest).subscribe({
              next: (event) => observer.next(event),
              error: (err) => observer.error(err),
              complete: () => observer.complete()
            });
          },
          error: (refreshError) => {
            // Refresh failed, show login modal
            this.isRefreshingToken = false;
            this.tokenRefreshedSubject.next(false);

            this.showLoginModalAndRetry(request, next).subscribe({
              next: (event) => observer.next(event),
              error: (err) => observer.error(err),
              complete: () => observer.complete()
            });
          }
        });
      });
    } else {
      // Wait for the token to be refreshed, then retry the request
      return this.tokenRefreshedSubject.pipe(
        filter(tokenRefreshed => tokenRefreshed !== false),
        take(1),
        switchMap(() => {
          const authService = this.injector.get(AuthService);
          const newToken = authService.getToken();
          const retryRequest = newToken
            ? request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              })
            : request;

          return next.handle(retryRequest);
        })
      );
    }
  }

  private showLoginModalAndRetry(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return new Observable(observer => {
      this.dialogService.openLoginModal().subscribe({
        next: (success) => {
          this.isRefreshingToken = false;

          if (success) {
            // Token renewed successfully, notify waiting requests
            this.tokenRefreshedSubject.next(true);

            // Retry the original request with the new token
            const authService = this.injector.get(AuthService);
            const newToken = authService.getToken();
            const retryRequest = newToken
              ? request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                })
              : request;

            next.handle(retryRequest).subscribe({
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
