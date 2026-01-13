const Permission = require('../models/permission.model');

// Get all permissions with optional filters
const getAllPermissions = async (filters = {}) => {
  try {
    const permissions = await Permission.find(filters).sort({
      category: 1,
      name: 1,
    });
    return permissions;
  } catch (error) {
    throw new Error(`Failed to get permissions: ${error.message}`);
  }
};

// Get permission by ID
const getPermissionById = async (permissionId) => {
  try {
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return permission;
  } catch (error) {
    throw error;
  }
};

// Get permissions by category
const getPermissionsByCategory = async (category) => {
  try {
    const validCategories = [
      'book',
      'user',
      'borrow',
      'reservation',
      'fine',
      'role',
      'system',
    ];
    if (!validCategories.includes(category)) {
      throw new Error(
        `Invalid category. Must be one of: ${validCategories.join(', ')}`
      );
    }

    const permissions = await Permission.find({ category }).sort({ name: 1 });
    return permissions;
  } catch (error) {
    throw error;
  }
};

// Create new permission
const createPermission = async (permissionData) => {
  try {
    const { name, description, category } = permissionData;

    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      throw new Error('Permission with this name already exists');
    }

    const permission = await Permission.create({
      name,
      description,
      category,
    });

    return permission;
  } catch (error) {
    throw error;
  }
};

// Update permission
const updatePermission = async (permissionId, updateData) => {
  try {
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Update allowed fields
    if (updateData.description) permission.description = updateData.description;
    if (updateData.category) permission.category = updateData.category;

    await permission.save();
    return permission;
  } catch (error) {
    throw error;
  }
};

// Delete permission
const deletePermission = async (permissionId) => {
  try {
    const permission = await Permission.findByIdAndDelete(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return permission;
  } catch (error) {
    throw error;
  }
};

// Validate permission exists (utility for other services)
const validatePermissionExists = async (permissionId) => {
  try {
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return true;
  } catch (error) {
    throw error;
  }
};

// Get multiple permissions by IDs
const getPermissionsByIds = async (permissionIds) => {
  try {
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    return permissions;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  getPermissionsByCategory,
  createPermission,
  updatePermission,
  deletePermission,
  validatePermissionExists,
  getPermissionsByIds,
};
