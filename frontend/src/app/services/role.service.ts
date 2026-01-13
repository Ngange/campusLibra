import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Permission } from './permission.service';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[] | Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleResponse {
  success: boolean;
  role?: Role;
  roles?: Role[];
  permissions?: Permission[];
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all roles
   */
  getAllRoles(): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(this.apiUrl).pipe(
      tap((response) => {
        if (response.roles) {
          this.rolesSubject.next(response.roles);
        }
      })
    );
  }

  /**
   * Get role by ID
   */
  getRoleById(id: string): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new role
   */
  createRole(
    role: Omit<Role, '_id' | 'createdAt' | 'updatedAt'>
  ): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(this.apiUrl, role).pipe(
      tap((response) => {
        if (response.role) {
          const current = this.rolesSubject.value;
          this.rolesSubject.next([...current, response.role]);
        }
      })
    );
  }

  /**
   * Update role
   */
  updateRole(
    id: string,
    updates: Partial<Omit<Role, '_id' | 'createdAt' | 'updatedAt'>>
  ): Observable<RoleResponse> {
    return this.http
      .put<RoleResponse>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        tap((response) => {
          if (response.role) {
            const current = this.rolesSubject.value;
            const index = current.findIndex((r) => r._id === id);
            if (index > -1) {
              current[index] = response.role;
              this.rolesSubject.next([...current]);
            }
          }
        })
      );
  }

  /**
   * Delete role
   */
  deleteRole(id: string): Observable<RoleResponse> {
    return this.http.delete<RoleResponse>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        if (response.success) {
          const current = this.rolesSubject.value;
          this.rolesSubject.next(current.filter((r) => r._id !== id));
        }
      })
    );
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(roleId: string): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/${roleId}/permissions`);
  }

  /**
   * Assign permission to role
   */
  assignPermissionToRole(
    roleId: string,
    permissionId: string
  ): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(
      `${this.apiUrl}/${roleId}/permissions/${permissionId}`,
      {}
    );
  }

  /**
   * Remove permission from role
   */
  removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Observable<RoleResponse> {
    return this.http.delete<RoleResponse>(
      `${this.apiUrl}/${roleId}/permissions/${permissionId}`
    );
  }

  /**
   * Bulk assign permissions to role
   */
  assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(
      `${this.apiUrl}/${roleId}/permissions/bulk/assign`,
      { permissionIds }
    );
  }

  /**
   * Get roles from cache (synchronous)
   */
  getRolesSync(): Role[] {
    return this.rolesSubject.value;
  }

  /**
   * Get role by name
   */
  getRoleByName(name: string): Role | undefined {
    return this.rolesSubject.value.find((r) => r.name === name);
  }

  /**
   * Check if role has permission
   */
  roleHasPermission(roleId: string, permissionId: string): boolean {
    const role = this.rolesSubject.value.find((r) => r._id === roleId);
    if (!role) return false;
    return role.permissions.some((perm) => {
      return typeof perm === 'string' ? perm === permissionId : perm._id === permissionId;
    });
  }

  /**
   * Get system roles (admin, librarian, member)
   */
  getSystemRoles(): Role[] {
    return this.rolesSubject.value.filter((r) =>
      ['admin', 'librarian', 'member'].includes(r.name)
    );
  }

  /**
   * Get custom roles (non-system roles)
   */
  getCustomRoles(): Role[] {
    return this.rolesSubject.value.filter(
      (r) => !['admin', 'librarian', 'member'].includes(r.name)
    );
  }
}
