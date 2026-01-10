const Permission = require('../models/permission.model');

const defaultPermissions = [
  // book permissions
  { name: 'book_view', description: 'View books', category: 'book' },
  { name: 'book_create', description: 'Add new books', category: 'book' },
  { name: 'book_update', description: 'Edit books', category: 'book' },
  { name: 'book_delete', description: 'Delete books', category: 'book' },

  // User permissions
  { name: 'user_view', description: 'View users', category: 'user' },
  { name: 'user_manage', description: 'Manage user roles', category: 'user' },

  // Borrow permissions
  { name: 'borrow_view', description: 'View borrows', category: 'borrow' },
  { name: 'borrow_create', description: 'Borrow books', category: 'borrow' },
  { name: 'borrow_return', description: 'Return books', category: 'borrow' },

  // Reservation permissions
  {
    name: 'reservation_view',
    description: 'View reservations',
    category: 'reservation',
  },
  {
    name: 'reservation_create',
    description: 'Create reservations',
    category: 'reservation',
  },
  {
    name: 'reservation_fulfill',
    description: 'Fulfill reservations',
    category: 'reservation',
  },

  // Fine permissions
  { name: 'fine_view', description: 'View fines', category: 'fine' },
  { name: 'fine_pay', description: 'Pay fines', category: 'fine' },

  // Role permissions
  {
    name: 'role_manage',
    description: 'Manage roles and permissions',
    category: 'role',
  },

  // System permissions
  {
    name: 'system_manage',
    description: 'Manage system configuration',
    category: 'system',
  },
];

const createPermissionsIfNotExists = async () => {
  for (const perm of defaultPermissions) {
    const exists = await Permission.findOne({ name: perm.name });
    if (!exists) {
      await Permission.create(perm);
      console.log(`Created permission: ${perm.name}`);
    }
  }
};

module.exports = { createPermissionsIfNotExists };
