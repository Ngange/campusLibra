import { Component, OnInit } from '@angular/core';
import { FineService } from '../../services/fine.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-fines',
  templateUrl: './my-fines.component.html',
  styleUrls: ['./my-fines.component.scss']
})
export class MyFinesComponent implements OnInit {
  fines: any[] = [];
  loading = false;
  error = '';
  totalOutstanding = 0;

  constructor(
    private fineService: FineService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMyFines();
  }

  loadMyFines(): void {
    this.loading = true;
    this.error = '';

    this.fineService.getMyFines().subscribe({
      next: (fines) => {
        this.fines = Array.isArray(fines) ? fines : [];
        this.totalOutstanding = this.fines
          .filter(fine => !fine.isPaid)
          .reduce((sum, fine) => sum + fine.amount, 0);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load your fines.';
        this.loading = false;
        this.fines = [];
        this.snackBar.open(this.error, 'Close', { duration: 5000 });
      }
    });
  }

  getStatusText(isPaid: boolean): string {
    return isPaid ? 'Paid' : 'Outstanding';
  }

  getStatusColor(isPaid: boolean): string {
    return isPaid ? 'accent' : 'warn';
  }
}
