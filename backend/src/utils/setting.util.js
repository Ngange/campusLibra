const Setting = require('../models/setting.model');

const defaultSettings = [
  { key: 'LOAN_PERIOD_DAYS', value: 14, description: 'Loan period in days' },
  {
    key: 'LOAN_PERIOD_UNIT',
    value: 'days',
    description: 'Unit for loan period: days, hours, or minutes (for testing)',
  },
  {
    key: 'FINE_RATE_PER_DAY',
    value: 0.5,
    description: 'Fine per overdue day (USD)',
  },
  {
    key: 'BOOK_COPY_STATUSES',
    value: ['available', 'borrowed', 'lost', 'damaged', 'reserved', 'on_hold'],
    description: 'Valid statuses for physical copies',
  },
  {
    key: 'BORROW_STATUSES',
    value: ['active', 'returned', 'overdue'],
    description: 'Valid borrow statuses',
  },
  {
    key: 'RESERVATION_STATUSES',
    value: ['pending', 'fulfilled', 'cancelled'],
    description: 'Valid reservation statuses',
  },
  {
    key: 'RESERVATION_HOLD_HOURS',
    value: 48,
    description: 'Hours a user has to pick up a reserved book',
  },
];

const createSettingsIfNotExists = async () => {
  for (const setting of defaultSettings) {
    const exists = await Setting.findOne({ key: setting.key });

    if (!exists) {
      await Setting.create(setting);
      console.log(`Initialized setting: ${setting.key}`);
    }
  }
};

module.exports = { createSettingsIfNotExists };
