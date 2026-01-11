import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './auth/landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './core/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// Member Components
import { MyBorrowsComponent } from './member/my-borrows/my-borrows.component';
import { MyReservationsComponent } from './member/my-reservations/my-reservations.component';
import { MyFinesComponent } from './member/my-fines/my-fines.component';
import { ProfileComponent } from './member/profile/profile.component';

// Librarian Components
import { ProcessReturnsComponent } from './librarian/process-returns/process-returns.component';

// Admin Components
import { UsersManageComponent } from './admin/users-manage/users-manage.component';

const routes: Routes = [
  // Public routes (no layout)
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes (with layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'books', loadChildren: () => import('./books/books.module').then(m => m.BooksModule) },

      // Member routes
      { path: 'my-borrows', component: MyBorrowsComponent, canActivate: [RoleGuard], data: { roles: ['member', 'librarian', 'admin'] } },
      { path: 'my-reservations', component: MyReservationsComponent, canActivate: [RoleGuard], data: { roles: ['member', 'librarian', 'admin'] } },
      { path: 'my-fines', component: MyFinesComponent, canActivate: [RoleGuard], data: { roles: ['member', 'librarian', 'admin'] } },
      { path: 'profile', component: ProfileComponent },

      // Librarian routes
      { path: 'process-returns', component: ProcessReturnsComponent, canActivate: [RoleGuard], data: { roles: ['librarian', 'admin'] } },

      // Admin routes
      { path: 'manage-users', component: UsersManageComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
    ]
  },

  { path: '**', redirectTo: '' } // Redirect unknown routes to landing
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
