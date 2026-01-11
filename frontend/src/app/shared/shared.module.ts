import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';

import { BookCardComponent } from './book-card/book-card.component';
import { BorrowCardComponent } from './borrow-card/borrow-card.component';
import { StatusBadgeComponent } from './status-badge/status-badge.component';

@NgModule({
  declarations: [
    BookCardComponent,
    BorrowCardComponent,
    StatusBadgeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule
  ],
  exports: [
    BookCardComponent,
    BorrowCardComponent,
    StatusBadgeComponent
  ]
})
export class SharedModule { }
