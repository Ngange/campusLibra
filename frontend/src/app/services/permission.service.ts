import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Permission {
  _id: string;
  name: string;
  description: string;
  category: 'book' | 'user' | 'borrow' | 'reservation' | 'fine' | 'role' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface PermissionResponse {
  success: boolean;
  permission?: Permission;
  permissions?: Permission[];
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all permissions
   */
  getAllPermissions(): Observable<PermissionResponse> {
    return this.http.get<PermissionResponse>(this.apiUrl).pipe(
      tap((response) => {
        if (response.permissions) {
          this.permissionsSubject.next(response.permissions);
        }
      })
    );
  }

  /**
   * Get permission by ID
   */
  getPermissionById(id: string): Observable<PermissionResponse> {
    return this.http.get<PermissionResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get permissions by category
   */
  getPermissionsByCategory(
    category: string
  ): Observable<PermissionResponse> {
    return this.http.get<PermissionResponse>(
      `${this.apiUrl}/category/${category}`
    );
  }

  /**
   * Create new permission
   */
  createPermission(
    permission: Omit<Permission, '_id' | 'createdAt' | 'updatedAt'>
  ): Observable<PermissionResponse> {
    return this.http.post<PermissionResponse>(this.apiUrl, permission).pipe(
      tap((response) => {
        if (response.permission) {
          const current = this.permissionsSubject.value;
          this.permissionsSubject.next([...current, response.permission]);
        }
      })
    );
  }

  /**
   * Update permission
   */
  updatePermission(
    id: string,
    updates: Partial<Omit<Permission, '_id' | 'createdAt' | 'updatedAt'>>
  ): Observable<PermissionResponse> {
    return this.http
      .put<PermissionResponse>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        tap((response) => {
          if (response.permission) {
            const current = this.permissionsSubject.value;
            const index = current.findIndex((p) => p._id === id);
            if (index > -1) {
              current[index] = response.permission;
              this.permissionsSubject.next([...current]);
            }
          }
        })
      );
  }

  /**
   * Delete permission
   */
  deletePermission(id: string): Observable<PermissionResponse> {
    return this.http.delete<PermissionResponse>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        if (response.success) {
          const current = this.permissionsSubject.value;
          this.permissionsSubject.next(current.filter((p) => p._id !== id));
        }
      })
    );
  }

  /**
   * Get permissions from cache (synchronous)
   */
  getPermissionsSync(): Permission[] {
    return this.permissionsSubject.value;
  }

  /**
   * Get permission by name
   */
  getPermissionByName(name: string): Permission | undefined {
    return this.permissionsSubject.value.find((p) => p.name === name);
  }

  /**
   * Get permissions by category (synchronous)
   */
  getPermissionsByCategorySync(category: string): Permission[] {
    return this.permissionsSubject.value.filter((p) => p.category === category);
  }
}
