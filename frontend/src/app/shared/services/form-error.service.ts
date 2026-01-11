import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  /**
   * Get user-friendly error message for a form control
   */
  getErrorMessage(control: AbstractControl | null, fieldName: string): string {
    if (!control) return 'Invalid input';

    if (control.hasError('required')) {
      return `${fieldName} is required`;
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `${fieldName} must be at least ${minLength} characters long`;
    }

    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `${fieldName} cannot exceed ${maxLength} characters`;
    }

    if (control.hasError('min')) {
      const min = control.errors?.['min']?.min;
      return `${fieldName} must be at least ${min}`;
    }

    if (control.hasError('max')) {
      const max = control.errors?.['max']?.max;
      return `${fieldName} cannot exceed ${max}`;
    }

    if (control.hasError('pattern')) {
      return `Invalid ${fieldName.toLowerCase()} format`;
    }

    if (control.hasError('invalidIsbn')) {
      return 'Please enter a valid ISBN-10 (10 digits) or ISBN-13 (13 digits)';
    }

    if (control.hasError('weakPassword')) {
      const errors = control.errors?.['weakPassword'];
      const requirements = [];
      if (!errors.hasUpperCase) requirements.push('uppercase letter');
      if (!errors.hasLowerCase) requirements.push('lowercase letter');
      if (!errors.hasNumeric) requirements.push('number');
      if (!errors.hasSpecialChar) requirements.push('special character');
      if (!errors.isLongEnough) requirements.push('at least 8 characters');

      return `Password must contain: ${requirements.join(', ')}`;
    }

    if (control.hasError('invalidDomain')) {
      return `Email domain not allowed`;
    }

    return 'Invalid input';
  }

  /**
   * Get error message for password mismatch
   */
  getPasswordMismatchError(formGroup: FormGroup): string {
    if (formGroup.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  /**
   * Check if a form control has any error
   */
  hasError(control: AbstractControl | null): boolean {
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched);
  }

  /**
   * Get all errors in a form group
   */
  getFormErrors(formGroup: FormGroup): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.invalid) {
        errors[key] = this.getErrorMessage(control, this.formatFieldName(key));
      }
    });

    return errors;
  }

  /**
   * Format field name from camelCase to Title Case
   */
  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before uppercase
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Mark all controls in a form group as touched
   */
  markAllAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }
}
