import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/user.model';

// Authentication service with JWT token and user state management
@Injectable({
  providedIn: 'root'
})

//  AuthService handles user authentication, session management, and user state
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Load user from localStorage on service initialization
  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  // POST to backend, stores token and user on success
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setSession(response.token, response.user))
    );
  }

  // POST to backend, auto-logs in user on registration success
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.setSession(response.token, response.user))
    );
  }

  // Clears token, user data, and redirects to home
  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(environment.tokenKey);
  }

  // Get user from localStorage using configured key
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(environment.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  // Stores token and user in localStorage, updates currentUser$ observable
  private setSession(token: string, user: User): void {
    localStorage.setItem(environment.tokenKey, token);
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Restores user session from localStorage on app startup
  private loadUserFromStorage(): void {
    if (this.isAuthenticated()) {
      const user = this.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }
}
