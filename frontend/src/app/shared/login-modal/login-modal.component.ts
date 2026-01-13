import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginModalComponent>
  ) {
    // Initialize form with validation rules
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Pre-fill email if user is already known
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.loginForm.patchValue({ email: currentUser.email });
    }
  }

  // Submit login credentials
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        // Close dialog and pass success result
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  // Close modal without logging in
  cancel(): void {
    this.dialogRef.close(false);
  }
}
