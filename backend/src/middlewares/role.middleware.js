// Middleware to authorize user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user.role is the role name (string) from the JWT token
    const userRole = req.user.role;

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: userRole,
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
