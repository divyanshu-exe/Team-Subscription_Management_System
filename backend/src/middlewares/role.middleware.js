// OWNER: BE-1
// PURPOSE: Role-based authorization middleware (requireRole)

const { fail } = require('../utils/apiResponse');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return fail(res, 'Forbidden: insufficient permissions', 403);
    }

    next();
  };
}



module.exports = requireRole;

