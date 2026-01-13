const Role = require('../models/role.model');
const permissionService = require('./permission.service');

// Get role with all its permissions populated
const getRoleWithPermissions = async (roleId) => {
  try {
    const role = await Role.findById(roleId).populate('permissions');
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  } catch (error) {
    throw error;
  }
};

// Get all permissions for a role
const getPermissionsForRole = async (roleId) => {
  try {
    const role = await Role.findById(roleId).populate('permissions');
    if (!role) {
      throw new Error('Role not found');
    }
    return role.permissions;
  } catch (error) {
    throw error;
  }
};

// Assign permission to role
const assignPermissionToRole = async (roleId, permissionId) => {
  try {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Validate permission exists
    await permissionService.validatePermissionExists(permissionId);

    // Check if permission already assigned
    if (role.permissions.includes(permissionId)) {
      throw new Error('Permission already assigned to this role');
    }

    role.permissions.push(permissionId);
    await role.save();

    return role.populate('permissions');
  } catch (error) {
    throw error;
  }
};

// Remove permission from role
const removePermissionFromRole = async (roleId, permissionId) => {
  try {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if permission is assigned
    if (!role.permissions.includes(permissionId)) {
      throw new Error('Permission not assigned to this role');
    }

    role.permissions = role.permissions.filter(
      (permId) => permId.toString() !== permissionId.toString()
    );

    await role.save();
    return role.populate('permissions');
  } catch (error) {
    throw error;
  }
};

// Assign multiple permissions to role (bulk operation)
const assignPermissionsToRole = async (roleId, permissionIds) => {
  try {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Validate all permissions exist
    await Promise.all(
      permissionIds.map((permId) =>
        permissionService.validatePermissionExists(permId)
      )
    );

    // Add only new permissions
    const newPermissions = permissionIds.filter(
      (permId) => !role.permissions.includes(permId)
    );

    role.permissions = [...role.permissions, ...newPermissions];
    await role.save();

    return role.populate('permissions');
  } catch (error) {
    throw error;
  }
};

// Check if role can be deleted (system roles cannot be deleted)
const canDeleteRole = (roleId) => {
  const SYSTEM_ROLES = ['admin', 'librarian', 'member'];
  return !SYSTEM_ROLES.includes(roleId);
};

// Get all roles with permissions
const getAllRolesWithPermissions = async () => {
  try {
    const roles = await Role.find({}).populate('permissions');
    return roles;
  } catch (error) {
    throw error;
  }
};

// Check if role has specific permission
const roleHasPermission = async (roleId, permissionName) => {
  try {
    const role = await Role.findById(roleId).populate('permissions');
    if (!role) {
      throw new Error('Role not found');
    }

    const hasPermission = role.permissions.some(
      (perm) => perm.name === permissionName
    );

    return hasPermission;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getRoleWithPermissions,
  getPermissionsForRole,
  assignPermissionToRole,
  removePermissionFromRole,
  assignPermissionsToRole,
  canDeleteRole,
  getAllRolesWithPermissions,
  roleHasPermission,
};
