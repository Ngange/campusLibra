import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { UsersManageComponent } from './users-manage/users-manage.component';
import { BooksManageComponent } from './books-manage/books-manage.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { PermissionManagementComponent } from './permission-management/permission-management.component';
import { RoleManagementComponent } from './role-management/role-management.component';

const routes: Routes = [
  { path: '', redirectTo: 'users-manage', pathMatch: 'full' },
  {
    path: 'users-manage',
    component: UsersManageComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'books-manage',
    component: BooksManageComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'system-settings',
    component: SystemSettingsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'audit-trail',
    component: AuditTrailComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'permissions',
    component: PermissionManagementComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'roles',
    component: RoleManagementComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
