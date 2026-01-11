import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const currentUser = this.authService.getCurrentUser() as any;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // Extract user role (handle both string and object formats)
    const userRole = typeof currentUser.role === 'string'
      ? currentUser.role
      : (currentUser.role as any)?.name || (currentUser.role as any)?.role || 'member';

    // Check if user has required role
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // Redirect to home if user doesn't have required role
    console.warn(`Access denied. User role: ${userRole}, Required: ${requiredRoles.join(', ')}`);
    this.router.navigate(['/home']);
    return false;
  }
}
