import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormErrorService } from '../../shared/services/form-error.service';
import { LoadingStateService } from '../../shared/services/loading-state.service';
import { passwordMatchValidator, strongPasswordValidator } from '../../shared/validators/custom-validators';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public formErrorService: FormErrorService,
    public loadingStateService: LoadingStateService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.formErrorService.markAllAsTouched(this.profileForm);
      return;
    }

    const userData = this.profileForm.value;
    this.loadingStateService.setLoading('profileSave', true);

    this.authService
      .updateProfile(userData)
      .pipe(finalize(() => this.loadingStateService.setLoading('profileSave', false)))
      .subscribe({
        next: (response) => {
          this.currentUser = response.user;
          this.profileForm.patchValue({
            name: response.user.name,
            email: response.user.email,
          });
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to update profile.';
          this.snackBar.open(message, 'Close', { duration: 4000 });
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.formErrorService.markAllAsTouched(this.passwordForm);
      return;
    }

    const passwordData = this.passwordForm.value;
    this.loadingStateService.setLoading('passwordChange', true);

    this.authService
      .changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      .pipe(finalize(() => this.loadingStateService.setLoading('passwordChange', false)))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Password changed successfully!', 'Close', { duration: 3000 });
          this.passwordForm.reset();
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to change password.';
          this.snackBar.open(message, 'Close', { duration: 4000 });
        },
      });
  }
}
