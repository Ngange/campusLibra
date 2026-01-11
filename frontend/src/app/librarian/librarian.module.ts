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
import { MatDialogModule } from '@angular/material/dialog';

import { SharedModule } from '../shared/shared.module';
import { LibrarianRoutingModule } from './librarian-routing.module';
import { ProcessReturnsComponent } from './process-returns/process-returns.component';
import { PendingPickupsComponent } from './pending-pickups/pending-pickups.component';
import { MemberManagementComponent } from './member-management/member-management.component';
import { ReturnBookModalComponent } from './return-book-modal/return-book-modal.component';

@NgModule({
  declarations: [
    ProcessReturnsComponent,
    PendingPickupsComponent,
    MemberManagementComponent,
    ReturnBookModalComponent
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
    MatDialogModule,
    SharedModule,
    LibrarianRoutingModule
  ]
})
export class LibrarianModule { }
