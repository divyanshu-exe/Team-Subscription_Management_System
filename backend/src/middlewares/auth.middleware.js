// OWNER: BE-1
// PURPOSE: Authenticate requests using JWT and attach current user to req.user

const { verifyJwt } = require('../utils/token');
const { fail } = require('../utils/apiResponse');
const prisma = require('../config/db');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.id) {
      return fail(res, 'Invalid token payload', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        customerId: true,
      },
    });

    if (!user || !user.isActive) {
      return fail(res, 'User inactive or not found', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return fail(res, 'Invalid or expired token', 401);
  }
}


module.exports = authMiddleware;

