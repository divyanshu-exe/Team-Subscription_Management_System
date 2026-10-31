// OWNER: BE-1
// PURPOSE: Zod validation middleware for body, query, and params

const { fail } = require('../utils/apiResponse');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        return fail(res, 'Validation failed', 400, err.errors);
      }
      return fail(res, 'Validation error', 400, [err.message]);
    }
  };
}

module.exports = validate;
