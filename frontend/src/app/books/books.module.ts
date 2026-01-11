import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BooksRoutingModule } from './books-routing.module';
import { BooksComponent } from './books.component';
import { BooksListComponent } from './books-list/books-list.component';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// Import shared module for BookCardComponent
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    BooksComponent,
    BooksListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BooksRoutingModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    SharedModule
  ]
})
export class BooksModule { }
