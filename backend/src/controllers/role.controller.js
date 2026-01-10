const Role = require('../models/role.model');

// List all roles
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json({ success: true, roles });
  } catch (error) {
    next(error);
  }
};

// Get role by ID
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ success: true, role });
  } catch (error) {
    next(error);
  }
};

// Create new role
const createRole = async (req, res, next) => {
  try {
    const { name, description, permissions = [] } = req.body;

    // Prevent creating system roles via API
    const systemRoles = ['admin', 'librarian', 'member'];
    if (systemRoles.includes(name)) {
      return res.status(400).json({
        message: 'Cannot create system roles via API. Use settings to modify.',
      });
    }

    const role = await Role.create({ name, description, permissions });
    res.status(201).json({ success: true, role });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Role name already exists' });
    }
    next(error);
  }
};

// Update role
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions) updateData.permissions = permissions;

    const role = await Role.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ success: true, role });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Role name already exists' });
    }
    next(error);
  }
};

// Delete role
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deletion of system roles
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const systemRoles = ['admin', 'librarian', 'member'];
    if (systemRoles.includes(role.name)) {
      return res.status(400).json({
        message: 'Cannot delete system roles',
      });
    }

    await Role.findByIdAndDelete(id);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
