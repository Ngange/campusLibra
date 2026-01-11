import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { BookCardComponent } from './book-card/book-card.component';

@NgModule({
  declarations: [
    BookCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    BookCardComponent
  ]
})
export class SharedModule { }
