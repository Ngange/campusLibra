import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss']
})
export class AuditTrailComponent implements OnInit {
  auditLogs: any[] = [];
  loading = false;
  filterForm: FormGroup;
  actions = ['borrowed', 'returned', 'reserved', 'book_created', 'book_updated', 'user_updated'];
  displayedColumns = ['timestamp', 'action', 'user', 'book', 'details'];

  constructor(
    private fb: FormBuilder,
    private auditService: AuditService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      userId: [''],
      bookId: [''],
      action: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadAuditTrail();
  }

  loadAuditTrail(): void {
    this.loading = true;
    const filters = this.filterForm.value;

    this.auditService.getAuditTrail(filters).subscribe({
      next: (logs) => {
        // Ensure array for MatTable
        this.auditLogs = Array.isArray(logs) ? logs : [];
        this.loading = false;
      },
      error: (err) => {
        this.auditLogs = []; // Fallback to empty array
        this.snackBar.open('Failed to load audit trail.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadAuditTrail();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadAuditTrail();
  }

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'borrowed': 'book',
      'returned': 'assignment_return',
      'reserved': 'bookmark',
      'book_created': 'library_add',
      'book_updated': 'edit',
      'user_updated': 'person'
    };
    return iconMap[action] || 'info';
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
