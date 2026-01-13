import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RoleService, Role, RoleResponse } from '../../services/role.service';
import { PermissionService, Permission } from '../../services/permission.service';
import { NotificationService } from '../../services/notification.service';
import { RolePermissionAssignmentDialogComponent } from '../role-permission-assignment-dialog/role-permission-assignment-dialog.component';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatChipsModule,
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleManagementComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: any;

  displayedColumns: string[] = ['name', 'description', 'permissionCount', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Role>([]);
  isLoading = false;
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  searchTerm = '';
  showSystemRoles = true;

  roleForm: FormGroup;
  showForm = false;
  isEditMode = false;
  selectedRole: Role | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.roleForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9_-]+$/),
        ],
      ],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.subscribeToRoleUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.roleService
      .getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RoleResponse) => {
          if (response.roles) {
            this.roles = response.roles;
            this.applyFilters();
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error loading roles:', error);
          this.snackBar.open('Failed to load roles', 'Close', { duration: 5000 });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  subscribeToRoleUpdates(): void {
    this.roleService.roles$.pipe(takeUntil(this.destroy$)).subscribe((roles: Role[]) => {
      this.roles = roles;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  applyFilters(): void {
    let filtered = this.roles;

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term)
      );
    }

    // Filter by system/custom roles
    if (!this.showSystemRoles) {
      filtered = filtered.filter(
        (r) => !['admin', 'librarian', 'member'].includes(r.name)
      );
    }

    this.filteredRoles = filtered;
    this.dataSource.data = filtered;
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  toggleSystemRoles(show: boolean): void {
    this.showSystemRoles = show;
    this.applyFilters();
  }

  toggleForm(): void {
    if (this.showForm) {
      this.resetForm();
    }
    this.showForm = !this.showForm;
    this.cdr.markForCheck();
  }

  resetForm(): void {
    this.roleForm.reset();
    this.isEditMode = false;
    this.selectedRole = null;
    this.showForm = false;
    this.cdr.markForCheck();
  }

  editRole(role: Role): void {
    // Prevent editing system roles
    if (['admin', 'librarian', 'member'].includes(role.name)) {
      this.snackBar.open('Cannot edit system roles', 'Close', { duration: 5000 });
      return;
    }

    this.isEditMode = true;
    this.selectedRole = role;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
    });
    this.showForm = true;
    this.cdr.markForCheck();
  }

  saveRole(): void {
    if (this.roleForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 5000,
      });
      return;
    }

    const formValue = this.roleForm.value;

    if (this.isEditMode && this.selectedRole) {
      this.updateRole(this.selectedRole._id, formValue);
    } else {
      this.createRole(formValue);
    }
  }

  createRole(data: Omit<Role, '_id' | 'createdAt' | 'updatedAt' | 'permissions'>): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.roleService
      .createRole({ ...data, permissions: [] })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RoleResponse) => {
          this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error creating role:', error);
          const message = error.error?.message || 'Failed to create role';
          this.snackBar.open(message, 'Close', { duration: 5000 });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  updateRole(id: string, data: Partial<Omit<Role, '_id' | 'createdAt' | 'updatedAt'>>): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.roleService
      .updateRole(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RoleResponse) => {
          this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
          this.resetForm();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('Error updating role:', error);
          const message = error.error?.message || 'Failed to update role';
          this.snackBar.open(message, 'Close', { duration: 5000 });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  deleteRole(role: Role): void {
    // Prevent deleting system roles
    if (['admin', 'librarian', 'member'].includes(role.name)) {
      this.snackBar.open('Cannot delete system roles', 'Close', { duration: 5000 });
      return;
    }

    if (confirm(`Are you sure you want to delete "${role.name}" role?`)) {
      this.isLoading = true;
      this.cdr.markForCheck();
      this.roleService
        .deleteRole(role._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: RoleResponse) => {
            this.snackBar.open('Role deleted successfully', 'Close', {
              duration: 3000,
            });
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error: any) => {
            console.error('Error deleting role:', error);
            const message = error.error?.message || 'Failed to delete role';
            this.snackBar.open(message, 'Close', { duration: 5000 });
            this.isLoading = false;
            this.cdr.markForCheck();
          },
        });
    }
  }

  openPermissionAssignmentDialog(role: Role): void {
    const dialogRef = this.dialog.open(RolePermissionAssignmentDialogComponent, {
      width: '600px',
      data: { role },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadRoles();
        }
      });
  }

  getPermissionCount(role: Role): number {
    return role.permissions.length;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  isSystemRole(role: Role): boolean {
    return ['admin', 'librarian', 'member'].includes(role.name);
  }
}
