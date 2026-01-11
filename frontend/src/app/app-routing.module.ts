import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './auth/landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  // TODO: Create dashboard modules - commented out until modules are created
  // { path: 'member', loadChildren: () => import('./member/member.module').then(m => m.MemberModule) },
  // { path: 'librarian', loadChildren: () => import('./librarian/librarian.module').then(m => m.LibrarianModule) },
  // { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

  { path: '**', redirectTo: '' } // Redirect unknown routes to landing
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
