// OWNER: BE-1
// PURPOSE: Standard API response formatting helpers

/**
 * Returns a standardized success response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message=""]
 * @param {number} [status=200]
 */
function ok(res, data = null, message = "", status = 200) {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
}

/**
 * Returns a standardized error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [status=400]
 * @param {any[]} [errors=[]]
 */
function fail(res, message = "Operation failed", status = 400, errors = []) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  ok,
  fail,
};