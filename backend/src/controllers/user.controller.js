const User = require('../models/user.model');
const Role = require('../models/role.model');

// List all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
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

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
