import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';
import { HomeComponent } from './home/home.component';

// Auth Components
import { LandingComponent } from './auth/landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

// Dashboard Components
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { LibrarianDashboardComponent } from './librarian/librarian-dashboard/librarian-dashboard.component';
import { MemberDashboardComponent } from './member/member-dashboard/member-dashboard.component';

// Shared Module
import { SharedModule } from './shared/shared.module';

// Angular Material Modules
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { LayoutModule } from './core/layout/layout.module';
import { NotificationsComponent } from './notifications/notifications.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { LoginModalComponent } from './shared/login-modal/login-modal.component';
import { DashboardRedirectComponent } from './dashboard-redirect.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    NotificationsComponent,
    ConfirmDialogComponent,
    LoginModalComponent,
    DashboardRedirectComponent,
    AdminDashboardComponent,
    LibrarianDashboardComponent,
    MemberDashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    SharedModule,
    // Material modules
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatGridListModule,
    MatBadgeModule,
    MatListModule,
    MatTabsModule,
    LayoutModule
  ],
  providers: [
    // Attach JWT token to all HTTP requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Global error handler for HTTP errors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
