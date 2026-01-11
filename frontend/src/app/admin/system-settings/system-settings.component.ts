import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingService } from '../../services/setting.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss']
})
export class SystemSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private settingService: SettingService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      LOAN_PERIOD_DAYS: ['', [Validators.required, Validators.min(1), Validators.max(365)]],
      FINE_RATE_PER_DAY: ['', [Validators.required, Validators.min(0.01), Validators.max(10)]],
      RESERVATION_HOLD_HOURS: ['', [Validators.required, Validators.min(1), Validators.max(168)]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.settingService.getSettings().subscribe({
      next: (response) => {
        // Ensure we always have an array
        const settings = Array.isArray(response) ? response : [];

        const settingsMap: any = {};
        settings.forEach((setting: any) => {
          settingsMap[setting.key] = setting.value;
        });

        this.settingsForm.patchValue({
          LOAN_PERIOD_DAYS: settingsMap['LOAN_PERIOD_DAYS'] || 14,
          FINE_RATE_PER_DAY: settingsMap['FINE_RATE_PER_DAY'] || 0.50,
          RESERVATION_HOLD_HOURS: settingsMap['RESERVATION_HOLD_HOURS'] || 48
        });
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load settings.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) return;

    this.saving = true;
    const formData = this.settingsForm.value;

    this.settingService.updateSetting('LOAN_PERIOD_DAYS', formData.LOAN_PERIOD_DAYS)
      .subscribe(() => {}, () => {});

    this.settingService.updateSetting('FINE_RATE_PER_DAY', formData.FINE_RATE_PER_DAY)
      .subscribe(() => {}, () => {});

    this.settingService.updateSetting('RESERVATION_HOLD_HOURS', formData.RESERVATION_HOLD_HOURS)
      .subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Settings updated successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open('Failed to update settings.', 'Close', { duration: 5000 });
        }
      });
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.settingsForm.patchValue({
        LOAN_PERIOD_DAYS: 14,
        FINE_RATE_PER_DAY: 0.50,
        RESERVATION_HOLD_HOURS: 48
      });
    }
  }
}
