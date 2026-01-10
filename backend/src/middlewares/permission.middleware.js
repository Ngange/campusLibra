const User = require('../models/user.model');

const authorizePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Get user with populated role and permissions
      const user = await User.findById(req.user.id).populate({
        path: 'role',
        populate: { path: 'permissions' },
      });

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Extract permission names
      const userPermissions = user.role.permissions.map((p) => p.name);

      // Check if user has ANY of the required permissions
      const hasPermission = requiredPermissions.some((rp) =>
        userPermissions.includes(rp)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required: requiredPermissions,
          available: userPermissions,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorizePermission };
