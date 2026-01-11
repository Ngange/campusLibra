import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './auth/landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './core/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NotificationsComponent } from './notifications/notifications.component';

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
      {
        path: 'member',
        loadChildren: () => import('./member/member.module').then(m => m.MemberModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'librarian',
        loadChildren: () => import('./librarian/librarian.module').then(m => m.LibrarianModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        canActivate: [AuthGuard]
      },
    ]
  },

  { path: '**', redirectTo: '' } // Redirect unknown routes to landing
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
