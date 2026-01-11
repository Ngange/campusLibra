import { Component, OnInit } from '@angular/core';
import { UserManagementService } from '../../services/user-management.service';
import { BorrowService } from '../../services/borrow.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-member-management',
  templateUrl: './member-management.component.html',
  styleUrls: ['./member-management.component.scss']
})
export class MemberManagementComponent implements OnInit {
  members: any[] = [];
  loading = false;
  error = '';
  selectedMember: any = null;
  memberBorrows: any[] = [];

  constructor(
    private userService: UserManagementService,
    private borrowService: BorrowService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getUsers({ role: 'member' }).subscribe({
      next: (response) => {
        this.members = Array.isArray(response.users) ? response.users : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load members.';
        this.loading = false;
        this.members = [];
        this.snackBar.open(this.error, 'Close', { duration: 5000 });
      }
    });
  }

  viewMemberDetails(member: any): void {
    this.selectedMember = member;
    // TODO: Implement loadMemberBorrows when backend endpoint is ready
    this.memberBorrows = [];
  }

  blockMember(userId: string): void {
    this.dialogService.confirm(
      'Are you sure you want to block this member?',
      'Block Member'
    ).subscribe(confirmed => {
      if (!confirmed) return;

      this.userService.blockUser(userId).subscribe({
      next: () => {
        this.snackBar.open('Member blocked successfully!', 'Close', { duration: 3000 });
        this.loadMembers();
      },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to block member.', 'Close', { duration: 5000 });
        }
      });
    });
  }

  unblockMember(userId: string): void {
    this.userService.unblockUser(userId).subscribe({
      next: () => {
        this.snackBar.open('Member unblocked successfully!', 'Close', { duration: 3000 });
        this.loadMembers();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to unblock member.', 'Close', { duration: 5000 });
      }
    });
  }
}
