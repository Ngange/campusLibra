import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Role, RoleResponse } from '../../services/role.service';
import { Permission, PermissionService, PermissionResponse } from '../../services/permission.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-permission-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatListModule,
    MatCheckboxModule,
  ],
  templateUrl: './role-permission-assignment-dialog.component.html',
  styleUrls: ['./role-permission-assignment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePermissionAssignmentDialogComponent implements OnInit, OnDestroy {
  role: Role;
  allPermissions: Permission[] = [];
  assignedPermissions: string[] = [];
  isLoading = false;
  isSaving = false;
  permissionsByCategory: Map<string, Permission[]> = new Map();
  categories = ['book', 'user', 'borrow', 'reservation', 'fine', 'role', 'system'];

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { role: Role },
    private roleService: RoleService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<RolePermissionAssignmentDialogComponent>,
    private cdr: ChangeDetectorRef
  ) {
    this.role = data.role;
    this.assignedPermissions = (this.role.permissions as string[]) || [];
  }

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.permissionService
      .getAllPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PermissionResponse) => {
          if (response.permissions) {
            this.allPermissions = response.permissions;
            this.groupPermissionsByCategory();
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading permissions:', error);
          this.snackBar.open('Failed to load permissions', 'Close', {
            duration: 5000,
          });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  groupPermissionsByCategory(): void {
    this.permissionsByCategory.clear();
    this.categories.forEach((category) => {
      const perms = this.allPermissions.filter((p) => p.category === category);
      if (perms.length > 0) {
        this.permissionsByCategory.set(category, perms);
      }
    });
  }

  isPermissionAssigned(permissionId: string): boolean {
    return this.assignedPermissions.includes(permissionId);
  }

  togglePermission(permissionId: string): void {
    const index = this.assignedPermissions.indexOf(permissionId);
    if (index > -1) {
      this.assignedPermissions.splice(index, 1);
    } else {
      this.assignedPermissions.push(permissionId);
    }
    this.cdr.markForCheck();
  }

  getAssignedCount(): number {
    return this.assignedPermissions.length;
  }

  getTotalCount(): number {
    return this.allPermissions.length;
  }

  saveChanges(): void {
    if (this.isSaving) return;

    this.isSaving = true;
    this.cdr.markForCheck();

    // Use bulk assign to replace all permissions
    this.roleService
      .assignPermissionsToRole(this.role._id, this.assignedPermissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RoleResponse) => {
          this.snackBar.open('Permissions updated successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error saving permissions:', error);
          const message = error.error?.message || 'Failed to save permissions';
          this.snackBar.open(message, 'Close', { duration: 5000 });
          this.isSaving = false;
          this.cdr.markForCheck();
        },
      });
  }

  selectAll(): void {
    this.assignedPermissions = this.allPermissions.map((p) => p._id);
    this.cdr.markForCheck();
  }

  clearAll(): void {
    this.assignedPermissions = [];
    this.cdr.markForCheck();
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
