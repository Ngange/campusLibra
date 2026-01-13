import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PermissionService, Permission, PermissionResponse } from '../../services/permission.service';
import { NotificationService } from '../../services/notification.service';

interface DialogData {
  permission?: Permission;
  isEdit: boolean;
}

@Component({
  selector: 'app-permission-management',
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
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionManagementComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: any;

  displayedColumns: string[] = ['name', 'description', 'category', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Permission>([]);
  isLoading = false;
  permissions: Permission[] = [];
  filteredPermissions: Permission[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories = ['book', 'user', 'borrow', 'reservation', 'fine', 'role', 'system'];

  permissionForm: FormGroup;
  showForm = false;
  isEditMode = false;
  selectedPermission: Permission | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private permissionService: PermissionService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.permissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      category: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.subscribeToPermissionUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.permissionService
      .getAllPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PermissionResponse) => {
          if (response.permissions) {
            this.permissions = response.permissions;
            this.applyFilters();
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading permissions:', error);
          this.snackBar.open('Failed to load permissions', 'Close', { duration: 5000 });
          this.isLoading = false;
        },
      });
  }

  subscribeToPermissionUpdates(): void {
    this.permissionService.permissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((permissions) => {
        this.permissions = permissions;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    let filtered = this.permissions;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter((p) => p.category === this.selectedCategory);
    }

    this.filteredPermissions = filtered;
    this.dataSource.data = filtered;
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  toggleForm(): void {
    if (this.showForm) {
      this.resetForm();
    }
    this.showForm = !this.showForm;
  }

  resetForm(): void {
    this.permissionForm.reset();
    this.isEditMode = false;
    this.selectedPermission = null;
    this.showForm = false;
  }

  editPermission(permission: Permission): void {
    this.isEditMode = true;
    this.selectedPermission = permission;
    this.permissionForm.patchValue({
      name: permission.name,
      description: permission.description,
      category: permission.category,
    });
    this.showForm = true;
  }

  savePermission(): void {
    if (this.permissionForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 5000,
      });
      return;
    }

    const formValue = this.permissionForm.value;

    if (this.isEditMode && this.selectedPermission) {
      this.updatePermission(this.selectedPermission._id, formValue);
    } else {
      this.createPermission(formValue);
    }
  }

  createPermission(data: Omit<Permission, '_id' | 'createdAt' | 'updatedAt'>): void {
    this.isLoading = true;
    this.permissionService
      .createPermission(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PermissionResponse) => {
          this.snackBar.open('Permission created successfully', 'Close', {
            duration: 3000,
          });
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error creating permission:', error);
          const message =
            error.error?.message || 'Failed to create permission';
          this.snackBar.open(message, 'Close', { duration: 5000 });
          this.isLoading = false;
        },
      });
  }

  updatePermission(id: string, data: Partial<Omit<Permission, '_id' | 'createdAt' | 'updatedAt'>>): void {
    this.isLoading = true;
    this.permissionService
      .updatePermission(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PermissionResponse) => {
          this.snackBar.open('Permission updated successfully', 'Close', {
            duration: 3000,
          });
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error updating permission:', error);
          const message =
            error.error?.message || 'Failed to update permission';
          this.snackBar.open(message, 'Close', { duration: 5000 });
          this.isLoading = false;
        },
      });
  }

  deletePermission(permission: Permission): void {
    if (confirm(`Are you sure you want to delete "${permission.name}" permission?`)) {
      this.isLoading = true;
      this.permissionService
        .deletePermission(permission._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: PermissionResponse) => {
            this.snackBar.open('Permission deleted successfully', 'Close', {
              duration: 3000,
            });
            this.isLoading = false;
          },
          error: (error: any) => {
            console.error('Error deleting permission:', error);
            const message =
              error.error?.message || 'Failed to delete permission';
            this.snackBar.open(message, 'Close', { duration: 5000 });
            this.isLoading = false;
          },
        });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      book: 'primary',
      user: 'accent',
      borrow: 'warn',
      reservation: 'primary',
      fine: 'warn',
      role: 'accent',
      system: 'warn',
    };
    return colors[category] || 'primary';
  }
}
