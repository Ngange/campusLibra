// Middleware to authorize user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // If the user's role is not in the allowed roles, deny access
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied: insufficient permissions',
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
