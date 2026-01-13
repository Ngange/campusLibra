const Role = require('../models/role.model');
const roleService = require('../services/role.service');
const permissionService = require('../services/permission.service');
const auditUtil = require('../utils/audit.util');

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
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
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
      const error = new Error(
        'Cannot create system roles via API. Use settings to modify.'
      );
      error.statusCode = 400;
      return next(error);
    }

    const role = await Role.create({ name, description, permissions });
    res.status(201).json({ success: true, role });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Role name already exists');
      duplicateError.statusCode = 409;
      return next(duplicateError);
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
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, role });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Role name already exists');
      duplicateError.statusCode = 409;
      return next(duplicateError);
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
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
    }

    const systemRoles = ['admin', 'librarian', 'member'];
    if (systemRoles.includes(role.name)) {
      const error = new Error('Cannot delete system roles');
      error.statusCode = 400;
      return next(error);
    }

    await Role.findByIdAndDelete(id);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all permissions for a role
const getRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
    }

    const permissions = await roleService.getPermissionsForRole(id);
    res.json({ success: true, permissions });
  } catch (error) {
    next(error);
  }
};

// Assign single permission to role
const assignPermissionToRole = async (req, res, next) => {
  try {
    const { id, permId } = req.params;

    // Validate role exists
    const role = await Role.findById(id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validate permission exists
    const permission = await permissionService.validatePermissionExists(permId);
    if (!permission) {
      const error = new Error('Permission not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if permission already assigned
    if (role.permissions.includes(permId)) {
      const error = new Error('Permission already assigned to this role');
      error.statusCode = 409;
      return next(error);
    }

    // Assign permission
    const updatedRole = await roleService.assignPermissionToRole(id, permId);

    // Log audit
    await auditUtil.logAudit({
      userId: req.user.id,
      action: 'ASSIGN_PERMISSION_TO_ROLE',
      entityType: 'Role',
      entityId: id,
      changes: {
        permissionId: permId,
        permissionName: permission.name,
      },
      details: `Assigned permission "${permission.name}" to role "${role.name}"`,
    });

    res.json({
      success: true,
      message: 'Permission assigned successfully',
      role: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};

// Remove permission from role
const removePermissionFromRole = async (req, res, next) => {
  try {
    const { id, permId } = req.params;

    // Validate role exists
    const role = await Role.findById(id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validate permission exists
    const permission = await permissionService.validatePermissionExists(permId);
    if (!permission) {
      const error = new Error('Permission not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if permission is assigned
    if (!role.permissions.includes(permId)) {
      const error = new Error('Permission not assigned to this role');
      error.statusCode = 404;
      return next(error);
    }

    // Remove permission
    const updatedRole = await roleService.removePermissionFromRole(id, permId);

    // Log audit
    await auditUtil.logAudit({
      userId: req.user.id,
      action: 'REMOVE_PERMISSION_FROM_ROLE',
      entityType: 'Role',
      entityId: id,
      changes: {
        permissionId: permId,
        permissionName: permission.name,
      },
      details: `Removed permission "${permission.name}" from role "${role.name}"`,
    });

    res.json({
      success: true,
      message: 'Permission removed successfully',
      role: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk assign permissions to role
const assignPermissionsToRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      const error = new Error('permissionIds must be a non-empty array');
      error.statusCode = 400;
      return next(error);
    }

    // Validate role exists
    const role = await Role.findById(id);
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validate all permissions exist
    const permissions = await permissionService.getPermissionsByIds(
      permissionIds
    );
    if (permissions.length !== permissionIds.length) {
      const error = new Error('One or more permissions not found');
      error.statusCode = 404;
      return next(error);
    }

    // Assign permissions
    const updatedRole = await roleService.assignPermissionsToRole(
      id,
      permissionIds
    );

    // Log audit
    await auditUtil.logAudit({
      userId: req.user.id,
      action: 'ASSIGN_PERMISSIONS_TO_ROLE',
      entityType: 'Role',
      entityId: id,
      changes: {
        permissionCount: permissionIds.length,
        permissionNames: permissions.map((p) => p.name),
      },
      details: `Assigned ${permissionIds.length} permissions to role "${role.name}"`,
    });

    res.json({
      success: true,
      message: 'Permissions assigned successfully',
      role: updatedRole,
    });
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
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  assignPermissionsToRole,
};
