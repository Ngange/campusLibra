import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser: any = null;
  userRole: string = 'member';
  unreadNotifications: number = 0; // Will implement later
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Close mobile menu when route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const rawRole = this.currentUser?.role;
    this.userRole = typeof rawRole === 'string' ? rawRole : rawRole?.name || rawRole?.role || 'member';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logoutAndClose(): void {
    this.closeMobileMenu();
    this.logout();
  }

  logout(): void {
    this.authService.logout();
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
