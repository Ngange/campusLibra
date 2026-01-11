import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(message: string, title: string = 'Confirm Action'): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title,
        message,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'confirm'
      } as ConfirmDialogData
    });

    return dialogRef.afterClosed();
  }

  alert(message: string, title: string = 'Notification'): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title,
        message,
        confirmText: 'OK',
        type: 'alert'
      } as ConfirmDialogData
    });

    return dialogRef.afterClosed();
  }

  delete(itemName: string): Observable<boolean> {
    return this.confirm(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      'Confirm Delete'
    );
  }
}
