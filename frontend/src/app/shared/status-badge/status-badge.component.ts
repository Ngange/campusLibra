import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: false,
  template: `
    <span class="status-badge" [class]="badgeClass">
      {{ displayText }}
    </span>
  `,
  styles: [`
    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .active { background-color: #e8f5e8; color: #2e7d32; }
    .overdue { background-color: #ffebee; color: #c62828; }
    .returned { background-color: #e0e0e0; color: #616161; }
    .pending { background-color: #fff8e1; color: #ff8f00; }
    .on-hold { background-color: #e3f2fd; color: #1565c0; }
    .fulfilled { background-color: #e8f5e8; color: #2e7d32; }
    .cancelled { background-color: #ffebee; color: #c62828; }
    .paid { background-color: #e8f5e8; color: #2e7d32; }
    .outstanding { background-color: #ffebee; color: #c62828; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() customText?: string;

  get badgeClass(): string {
    switch (this.status.toLowerCase()) {
      case 'active': return 'active';
      case 'overdue': return 'overdue';
      case 'returned': return 'returned';
      case 'pending': return 'pending';
      case 'on_hold':
      case 'on-hold': return 'on-hold';
      case 'fulfilled': return 'fulfilled';
      case 'cancelled': return 'cancelled';
      case 'paid': return 'paid';
      case 'outstanding': return 'outstanding';
      default: return 'active';
    }
  }

  get displayText(): string {
    return this.customText || this.status.replace('_', ' ').replace('-', ' ');
  }
}
