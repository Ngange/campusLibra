import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService } from '../../services/user-management.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-users-manage',
  standalone: false,
  templateUrl: './users-manage.component.html',
  styleUrls: ['./users-manage.component.scss']
})
export class UsersManageComponent implements OnInit, OnDestroy {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = false;
  error: string | null = null;
  editingUser: any = null;
  editForm: FormGroup;
  searchTerm = '';
  roles = ['member', 'librarian', 'admin'];
  actionInProgress: { [key: string]: boolean } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['member', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Ensure array for MatTable
          const usersData = response.data || response.users || response || [];
          this.users = Array.isArray(usersData) ? usersData : [];
          this.applyFilter();
          this.loading = false;
        },
        error: (err) => {
          this.users = []; // Always fallback to empty array
          this.error = 'Failed to load users.';
          this.loading = false;
        }
      });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(u =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  startEdit(user: any): void {
    this.editingUser = user;
    this.editForm.patchValue({
      name: user.name,
      email: user.email,
      role: typeof user.role === 'string' ? user.role : user.role?.name || 'member'
    });
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editForm.reset();
  }

  saveUser(): void {
    if (!this.editForm.valid || !this.editingUser) return;

    this.actionInProgress[this.editingUser._id] = true;
    const updatedData = this.editForm.value;

    this.userService.updateUser(this.editingUser._id, updatedData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('User updated successfully!');
          this.actionInProgress[this.editingUser._id] = false;
          this.editingUser = null;
          this.loadUsers();
        },
        error: (err) => {
          this.actionInProgress[this.editingUser._id] = false;
          alert(err.error?.message || 'Failed to update user.');
        }
      });
  }

  deleteUser(userId: string, userName: string): void {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    this.actionInProgress[userId] = true;

    this.userService.deleteUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('User deleted successfully!');
          this.actionInProgress[userId] = false;
          this.loadUsers();
        },
        error: (err) => {
          this.actionInProgress[userId] = false;
          alert(err.error?.message || 'Failed to delete user.');
        }
      });
  }

  blockUser(userId: string): void {
    this.actionInProgress[userId] = true;

    this.userService.blockUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('User blocked successfully!');
          this.actionInProgress[userId] = false;
          this.loadUsers();
        },
        error: (err) => {
          this.actionInProgress[userId] = false;
          alert(err.error?.message || 'Failed to block user.');
        }
      });
  }

  unblockUser(userId: string): void {
    this.actionInProgress[userId] = true;

    this.userService.unblockUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('User unblocked successfully!');
          this.actionInProgress[userId] = false;
          this.loadUsers();
        },
        error: (err) => {
          this.actionInProgress[userId] = false;
          alert(err.error?.message || 'Failed to unblock user.');
        }
      });
  }

  getRoleDisplay(user: any): string {
    if (typeof user.role === 'string') return user.role;
    if (user.role?.name) return user.role.name;
    return 'member';
  }
}
