import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { UsersManageComponent } from './users-manage/users-manage.component';
import { BooksManageComponent } from './books-manage/books-manage.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';

@NgModule({
  declarations: [
    UsersManageComponent,
    BooksManageComponent,
    SystemSettingsComponent,
    AuditTrailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatMenuModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
