const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

const createRolesIfNotExists = async () => {
  // Get all permissions first
  const permissions = await Permission.find();

  const roles = [
    {
      name: 'admin',
      description: 'Full system access',
      permissions: permissions.map((p) => p._id), // Admin gets ALL permissions
    },
    {
      name: 'librarian',
      description: 'Manage books and borrows',
      permissions: permissions
        .filter(
          (p) =>
            p.category === 'book' ||
            p.category === 'borrow' ||
            p.category === 'reservation' ||
            p.category === 'fine' ||
            p.name === 'user_view' // Can view users but not manage
        )
        .map((p) => p._id),
    },
    {
      name: 'member',
      description: 'Borrow and reserve books',
      permissions: permissions
        .filter(
          (p) =>
            p.name === 'book_view' ||
            p.name === 'borrow_create' ||
            p.name === 'borrow_view' ||
            p.name === 'reservation_create' ||
            p.name === 'reservation_view' ||
            p.name === 'fine_view'
        )
        .map((p) => p._id),
    },
  ];

  for (const roleData of roles) {
    const existing = await Role.findOne({ name: roleData.name });
    if (!existing) {
      await Role.create(roleData);
      console.log(`Created role: ${roleData.name}`);
    }
  }
};

module.exports = { createRolesIfNotExists };
