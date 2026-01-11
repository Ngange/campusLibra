import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { ProcessReturnsComponent } from './process-returns/process-returns.component';
import { PendingPickupsComponent } from './pending-pickups/pending-pickups.component';
import { MemberManagementComponent } from './member-management/member-management.component';

const routes: Routes = [
  { path: '', redirectTo: 'process-returns', pathMatch: 'full' },
  {
    path: 'process-returns',
    component: ProcessReturnsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['librarian', 'admin'] }
  },
  {
    path: 'pending-pickups',
    component: PendingPickupsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['librarian', 'admin'] }
  },
  {
    path: 'member-management',
    component: MemberManagementComponent,
    canActivate: [RoleGuard],
    data: { roles: ['librarian', 'admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LibrarianRoutingModule {}
