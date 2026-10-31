// OWNER: BE-1
// PURPOSE: Global error handling middleware mapping Prisma, Zod, and unexpected errors

const { fail } = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return fail(res, 'A record with this identifier already exists (Conflict)', 409, [
      { code: err.code, meta: err.meta },
    ]);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return fail(res, 'Record not found', 404, [
      { code: err.code, meta: err.meta },
    ]);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return fail(res, 'Validation failed', 400, err.errors);
  }

  // Standard 400 or custom status errors
  if (err.status && err.status >= 400 && err.status < 500) {
    return fail(res, err.message, err.status, err.errors || []);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  return fail(
    res,
    err.message || 'Internal server error',
    500,
    isProduction ? [] : [err.stack]
  );
}


module.exports = errorMiddleware;


