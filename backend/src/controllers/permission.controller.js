const Permission = require('../models/permission.model');
const { createAuditLog } = require('../utils/audit.util');

// Get all permissions with optional filtering
const getAllPermissionsHandler = async (req, res, next) => {
  try {
    const { category, name } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const permissions = await Permission.find(filter).sort({
      category: 1,
      name: 1,
    });

    res.json({
      success: true,
      count: permissions.length,
      permissions,
    });
  } catch (error) {
    next(error);
  }
};

// Get permission by ID
const getPermissionByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findById(id);

    if (!permission) {
      const error = new Error('Permission not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, permission });
  } catch (error) {
    next(error);
  }
};

// Get permissions by category
const getPermissionsByCategoryHandler = async (req, res, next) => {
  try {
    const { category } = req.params;

    // Validate category is valid enum value
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
      const error = new Error(
        `Invalid category. Must be one of: ${validCategories.join(', ')}`
      );
      error.statusCode = 400;
      return next(error);
    }

    const permissions = await Permission.find({ category }).sort({ name: 1 });

    res.json({
      success: true,
      category,
      count: permissions.length,
      permissions,
    });
  } catch (error) {
    next(error);
  }
};

// Create new permission
const createPermissionHandler = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;
    const adminId = req.user.id;

    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      const error = new Error('Permission with this name already exists');
      error.statusCode = 409;
      return next(error);
    }

    // Create permission
    const permission = await Permission.create({
      name,
      description,
      category,
    });

    // Log audit event
    await createAuditLog('PERMISSION_CREATED', adminId, {
      permissionId: permission._id,
      permissionName: permission.name,
      category: permission.category,
    });

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      permission,
    });
  } catch (error) {
    next(error);
  }
};

// Update permission
const updatePermissionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, category } = req.body;
    const adminId = req.user.id;

    const permission = await Permission.findById(id);
    if (!permission) {
      const error = new Error('Permission not found');
      error.statusCode = 404;
      return next(error);
    }

    const oldValues = {
      description: permission.description,
      category: permission.category,
    };

    // Update permission
    if (description) permission.description = description;
    if (category) permission.category = category;

    await permission.save();

    // Log audit event
    await createAuditLog('PERMISSION_UPDATED', adminId, {
      permissionId: permission._id,
      permissionName: permission.name,
      oldValues,
      newValues: {
        description: permission.description,
        category: permission.category,
      },
    });

    res.json({
      success: true,
      message: 'Permission updated successfully',
      permission,
    });
  } catch (error) {
    next(error);
  }
};

// Delete permission
const deletePermissionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const permission = await Permission.findByIdAndDelete(id);

    if (!permission) {
      const error = new Error('Permission not found');
      error.statusCode = 404;
      return next(error);
    }

    // Log audit event
    await createAuditLog('PERMISSION_DELETED', adminId, {
      permissionId: permission._id,
      permissionName: permission.name,
      category: permission.category,
    });

    res.json({
      success: true,
      message: 'Permission deleted successfully',
      permission,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPermissionsHandler,
  getPermissionByIdHandler,
  getPermissionsByCategoryHandler,
  createPermissionHandler,
  updatePermissionHandler,
  deletePermissionHandler,
};
