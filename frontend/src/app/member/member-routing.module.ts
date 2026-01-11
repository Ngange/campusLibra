import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { MyBorrowsComponent } from './my-borrows/my-borrows.component';
import { MyReservationsComponent } from './my-reservations/my-reservations.component';
import { MyFinesComponent } from './my-fines/my-fines.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'my-borrows', pathMatch: 'full' },
  {
    path: 'my-borrows',
    component: MyBorrowsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['member', 'librarian', 'admin'] }
  },
  {
    path: 'my-reservations',
    component: MyReservationsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['member', 'librarian', 'admin'] }
  },
  {
    path: 'my-fines',
    component: MyFinesComponent,
    canActivate: [RoleGuard],
    data: { roles: ['member', 'librarian', 'admin'] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [RoleGuard],
    data: { roles: ['member', 'librarian', 'admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule {}
