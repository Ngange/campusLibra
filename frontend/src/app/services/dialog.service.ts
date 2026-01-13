import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { LoginModalComponent } from '../shared/login-modal/login-modal.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private loginDialogOpen = false;

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

  // Open login modal when token expires - prevent multiple dialogs
  openLoginModal(): Observable<boolean> {
    // Prevent multiple login dialogs from opening simultaneously
    if (this.loginDialogOpen) {
      return new Observable(observer => observer.next(false));
    }

    this.loginDialogOpen = true;

    const dialogRef = this.dialog.open(LoginModalComponent, {
      width: '450px',
      disableClose: true, // Prevent closing by clicking outside
      panelClass: 'login-modal-dialog'
    });

    return new Observable(observer => {
      dialogRef.afterClosed().subscribe(result => {
        this.loginDialogOpen = false;
        observer.next(result === true);
        observer.complete();
      });
    });
  }
}
