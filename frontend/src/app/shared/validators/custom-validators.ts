import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for matching password fields
 * Usage: { validators: passwordMatchValidator }
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { 'passwordMismatch': true };
}

/**
 * Validator for ISBN-10 and ISBN-13 formats
 */
export function isbnValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isbn = control.value;
    if (!isbn) return null;

    // Remove hyphens, spaces, and convert to uppercase
    const cleanIsbn = isbn.replace(/[-\s]/g, '').toUpperCase();

    // Check if it's 10 or 13 digits
    if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
      return { 'invalidIsbn': true };
    }

    // ISBN-10: 9 digits followed by a digit or X
    const isbn10Regex = /^[0-9]{9}[0-9X]$/;
    // ISBN-13: 13 digits
    const isbn13Regex = /^[0-9]{13}$/;

    if (cleanIsbn.length === 10 && !isbn10Regex.test(cleanIsbn)) {
      return { 'invalidIsbn': true };
    }

    if (cleanIsbn.length === 13 && !isbn13Regex.test(cleanIsbn)) {
      return { 'invalidIsbn': true };
    }

    // TODO: Add checksum validation for ISBN-10 and ISBN-13 if needed
    return null;
  };
}

/**
 * Validator for strong passwords
 * Requires: uppercase, lowercase, number, special character, min 8 chars
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!hasUpperCase || !hasLowerCase || !hasNumeric || !hasSpecialChar || !isLongEnough) {
      return {
        'weakPassword': {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar,
          isLongEnough
        }
      };
    }

    return null;
  };
}

/**
 * Validator for email domain whitelist (optional)
 * @param domains Array of allowed email domains
 */
export function emailDomainValidator(domains: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    if (!email) return null;

    const domain = email.split('@')[1];
    const isAllowed = domains.some(d => domain === d);

    return isAllowed ? null : { 'invalidDomain': true };
  };
}
