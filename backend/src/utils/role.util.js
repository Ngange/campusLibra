const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

const createRolesIfNotExists = async () => {
  // Get all permissions first
  const permissions = await Permission.find();

  // Always ensure admin has ALL current permissions
  const adminExisting = await Role.findOne({ name: 'admin' });
  if (adminExisting) {
    const allPermIds = permissions.map((p) => p._id);
    adminExisting.permissions = allPermIds;
    await adminExisting.save();
    console.log('Updated role: admin (synced permissions)');
  }

  // Always ensure librarian has correct permissions
  const librarianExisting = await Role.findOne({ name: 'librarian' });
  if (librarianExisting) {
    const librarianPermIds = permissions
      .filter(
        (p) =>
          p.category === 'book' ||
          p.category === 'borrow' ||
          p.category === 'reservation' ||
          p.category === 'fine' ||
          p.name === 'user_view' ||
          p.name === 'user_manage' // Can manage (block/unblock) users
      )
      .map((p) => p._id);
    librarianExisting.permissions = librarianPermIds;
    await librarianExisting.save();
    console.log('Updated role: librarian (synced permissions)');
  }

  // Always ensure member has correct permissions
  const memberExisting = await Role.findOne({ name: 'member' });
  if (memberExisting) {
    const memberPermIds = permissions
      .filter(
        (p) =>
          p.name === 'book_view' ||
          p.name === 'borrow_create' ||
          p.name === 'borrow_view' ||
          p.name === 'reservation_create' ||
          p.name === 'reservation_view' ||
          p.name === 'fine_view'
      )
      .map((p) => p._id);
    memberExisting.permissions = memberPermIds;
    await memberExisting.save();
    console.log('Updated role: member (synced permissions)');
  }

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
            p.name === 'user_view' ||
            p.name === 'user_manage' // Can manage (block/unblock) users
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
