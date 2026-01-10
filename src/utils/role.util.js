const Role = require('../models/role.model');

const createRolesIfNotExists = async () => {
  const roles = [
    { name: 'admin', description: 'Full system access' },
    { name: 'librarian', description: 'Manage books and borrows' },
    { name: 'member', description: 'Borrow and reserve books' },
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
