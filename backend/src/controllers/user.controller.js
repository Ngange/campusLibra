const User = require('../models/user.model');
const Role = require('../models/role.model');
const { logUserAuditEvent } = require('../utils/audit.util');
const { emitNotification } = require('../utils/notification.util');

// List all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    let filter = {};

    // If role filter is provided, find role by name and filter users
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      } else {
        // Role doesn't exist, return empty array
        return res.json({ success: true, users: [] });
      }
    }

    const users = await User.find(filter)
      .select('-password') // Never return passwords
      .populate('role', 'name description');

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-password')
      .populate('role', 'name description');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update user (e.g., change role)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role: roleName } = req.body;

    // Find new role if provided
    let roleId = undefined;
    if (roleName) {
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        const error = new Error('Invalid role');
        error.statusCode = 400;
        return next(error);
      }
      roleId = role._id;
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (roleId) updateData.role = roleId;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('role', 'name');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Log audit event
    const performedBy = req.user?.id || req.user?._id;
    if (performedBy) {
      await logUserAuditEvent('USER_UPDATED', performedBy, id, {
        userName: user.name,
        userEmail: user.email,
        changes: Object.keys(updateData),
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Email already in use');
      duplicateError.statusCode = 409;
      return next(duplicateError);
    }
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Log audit event
    const performedBy = req.user?.id || req.user?._id;
    if (performedBy) {
      await logUserAuditEvent('USER_DELETED', performedBy, id, {
        userName: user.name,
        userEmail: user.email,
      });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Block user
const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    )
      .select('-password')
      .populate('role', 'name');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Log audit event
    const performedBy = req.user?.id || req.user?._id;
    if (performedBy) {
      await logUserAuditEvent('USER_BLOCKED', performedBy, id, {
        userName: user.name,
        userEmail: user.email,
      });
    }

    // Notify the blocked user
    await emitNotification(
      id,
      'Account Blocked',
      'Your account has been blocked. Please contact support for assistance.',
      'user_blocked',
      id,
      'User'
    );

    // Notify all admins
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      const admins = await User.find({ role: adminRole._id, isBlocked: false });
      for (const admin of admins) {
        await emitNotification(
          admin._id,
          'User Blocked',
          `User ${user.name} (${user.email}) has been blocked by a ${
            req.user.role?.name || 'librarian'
          }.`,
          'user_blocked',
          id,
          'User'
        );
      }
    }

    res.json({ success: true, user, message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

// Unblock user
const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    )
      .select('-password')
      .populate('role', 'name');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Log audit event
    const performedBy = req.user?.id || req.user?._id;
    if (performedBy) {
      await logUserAuditEvent('USER_UNBLOCKED', performedBy, id, {
        userName: user.name,
        userEmail: user.email,
      });
    }

    // Notify the unblocked user
    await emitNotification(
      id,
      'Account Unblocked',
      'Your account has been unblocked. You can now access the system.',
      'user_unblocked',
      id,
      'User'
    );

    // Notify all admins
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      const admins = await User.find({ role: adminRole._id, isBlocked: false });
      for (const admin of admins) {
        await emitNotification(
          admin._id,
          'User Unblocked',
          `User ${user.name} (${user.email}) has been unblocked by a ${
            req.user.role?.name || 'librarian'
          }.`,
          'user_unblocked',
          id,
          'User'
        );
      }
    }

    res.json({ success: true, user, message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
};
